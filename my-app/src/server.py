import json
import logging
import re
import uuid
from datetime import datetime, timedelta

import requests
from flask_login import UserMixin
import bcrypt
import boto3
import mysql.connector as mysql
import mysql.connector.pooling
from botocore.exceptions import NoCredentialsError
from flask import Flask, request, jsonify, abort, make_response, redirect
from flask_cors import CORS
from settings import aws_access_key_id, aws_secret_access_key, bucket_name, local_db_endpoint, google_client_secret, \
    google_client_id, google_redirect_uri, google_discovery_url
from settings import dbpwd
from flask_restful import Resource
from oauthlib.oauth2 import WebApplicationClient

# app = Flask(__name__)
app = Flask(__name__,
            static_folder='/home/ubuntu/build',
            static_url_path='/')

#CORS(app, supports_credentials=True,
#     origins=["http://127.0.0.1:5000", "http://127.0.0.1:3000", "https://accounts.google.com"],
#     expose_headers='Set-Cookie')
CORS(app)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}

pool = mysql.connector.pooling.MySQLConnectionPool(
    host=local_db_endpoint,
    user="root",
    passwd=dbpwd,
    database="app",
    buffered=True,
    pool_size=6,
    pool_name='database'
)


@app.route('/SignUp')
@app.route('/Login')
@app.route('/Account')
@app.route('/AboutMe')
@app.route('/NewPost')
def catch_all():
    return app.send_static_file("index.html")


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def is_session_expired(session_id):
    if session_id:
        db = pool.get_connection()
        cursor = db.cursor()
        query = "SELECT expiration_time FROM session WHERE session_id = %s"
        values = (session_id,)
        cursor.execute(query, values)
        expiration_time = cursor.fetchone()
        cursor.close()
        db.close()
        if expiration_time is None:
            return True

        if expiration_time:
            expiration_time = expiration_time[0]
            current_time = datetime.now()
            expiration_threshold = current_time + timedelta(hours=2)

            if expiration_time > expiration_threshold:
                return True

    return False


def find_country_name(code):
    with open('countries_codes.js', 'r') as file:
        contents = file.read()
        start_index = contents.find('[')
        end_index = contents.find(']') + 1
        json_data = contents[start_index:end_index]
        countries = json.loads(json_data)

        for country in countries:
            if country['code'] == code:
                return country['name']

        return None


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/GetUserProfile', methods=['GET'])
def get_user_profile():
    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id == '' or session_id == None:
        resp = make_response(jsonify({"massage": "session expired"}))
        resp.set_cookie(
            "session_id",
            value='',
            expires='Thu, 01 Jan 1970 00:00:00 GMT',
            path="/"
        )
        resp.status_code = 401
        return resp

    db = pool.get_connection()
    cursor = db.cursor()

    query = "SELECT u.username, u.role, u.country_code FROM users u INNER JOIN session s ON u.id = s.id WHERE s.session_id = %s"
    values = (session_id,)
    cursor.execute(query, values)
    user_profile = cursor.fetchone()

    print(user_profile)
    query = "SELECT name FROM country WHERE code = %s"
    values = (user_profile[2],)
    cursor.execute(query, values)
    country_name = cursor.fetchone()
    cursor.close()
    db.close()

    if user_profile:
        profile_data = {
            'isAuthenticated': True,
            'username': user_profile[0],
            'role': user_profile[1],
            'country': country_name
        }
        return jsonify(profile_data), 200
    else:
        abort(401, 'User profile not found.')


@app.route('/SignUp', methods=['POST'])
def SignUp():
    data = request.get_json()
    username = data['username']
    country_code = data['country_code']
    password = data['password']
    if username == "" or username is None:
        abort(400, 'Fill')
    db = pool.get_connection()
    cursor = db.cursor()
    query = "SELECT code FROM country WHERE code = %s"
    values = (country_code,)
    cursor.execute(query, values)
    country_exists = cursor.fetchone()

    if not country_exists:
        query = "INSERT INTO country (code, name) VALUES (%s, %s)"
        values = (country_code, find_country_name(country_code))
        cursor.execute(query, values)

    query = "SELECT id FROM users WHERE username = %s"
    values = (username,)
    cursor.execute(query, values)
    record = cursor.fetchone()
    if record:
        db.close()
        abort(400, 'User already exists.')

    # Insert new user

    query = "INSERT INTO users (username, role, country_code, created_at, password) VALUES (%s, %s, %s, NOW(), %s)"
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    values = (username, 'user', country_code, hashed_password.decode('utf-8'))
    cursor.execute(query, values)
    user_id = cursor.lastrowid
    session_id = str(uuid.uuid4())

    expiration_time = datetime.now() + timedelta(hours=2)
    query = "INSERT INTO session (id, session_id,expiration_time) VALUES (%s, %s,%s)"
    values = (user_id, session_id, expiration_time)
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    db.close()

    resp = make_response(jsonify({'message': 'User registered successfully.'}))
    resp.set_cookie(
        "session_id",
        value=session_id,
        expires=datetime.now() + timedelta(hours=2),
        path="/"

    )
    return resp


def validate_credentials(username, password):
    # Username validation: only allows strings
    if not isinstance(username, str):
        return False

    # Password validation: allows only digits, letters, and special characters
    if not isinstance(password, str):
        return False

    if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};:\'"|\\,.?/`~]*$', password):
        return False

    return True


logger = logging.getLogger('login_attempts')
logger.setLevel(logging.INFO)

# Create a file handler
file_handler = logging.FileHandler('login_attempts.log')

# Create a formatter and add it to the file handler
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

# Add the file handler to the logger
logger.addHandler(file_handler)

@app.route('/Login', methods=['POST'])
def login():
    data = request.get_json()
    if data['user'] == "" or data['pass'] == "" or data['user'] == None or data['pass'] == None:
        abort(400)
    if not validate_credentials(data['user'], data['pass']):
        abort(400)

    logger.info(f"User login attempt: username={data['user']}")

    db = pool.get_connection()
    query = "SELECT id, username, password FROM users WHERE username = %s"
    values = (data['user'],)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()

    expiration_time = datetime.now() + timedelta(hours=2)
    if not record:
        db.close()
        abort(401)

    user_id = record[0]
    hashed_password = record[2].encode('utf-8')

    if not bcrypt.checkpw(data['pass'].encode('utf-8'), hashed_password):
        db.close()
        abort(401)

    query = "SELECT session_id FROM session WHERE id = %s"
    values = (user_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    session_id = cursor.fetchone()
    cursor.close()

    flag = 0
    if session_id[0] == '':
        flag = 1
        query = "UPDATE session SET session_id = %s, expiration_time= %s WHERE id = %s"
        session_id = str(uuid.uuid4())
        values = (session_id, expiration_time, user_id)
        cursor = db.cursor()
        cursor.execute(query, values)
        db.commit()
        cursor.close()

    if not session_id[0]:
        flag = 1
        query = "INSERT INTO session (id, session_id,expiration_time) VALUES (%s, %s,%s)"
        session_id = str(uuid.uuid4())
        values = (record[0], session_id, expiration_time)
        cursor = db.cursor()
        cursor.execute(query, values)
        db.commit()
        cursor.close()

    db.close()

    if flag == 0:
        session_id = session_id[0]

    resp = make_response(jsonify({'session_id': session_id}))
    resp.set_cookie(
        "session_id",
        value=str(session_id),
        samesite='None',
        secure=True
    )
    return resp


@app.route('/Logout', methods=['POST'])
def logout():
    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id):
        abort(401)

    db = pool.get_connection()
    cursor = db.cursor()

    query = "UPDATE session SET session_id = '' WHERE session_id = %s"
    values = (session_id,)
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    db.close()

    resp = make_response(jsonify({'message': 'Logout successful.'}))
    # resp.delete_cookie("session_id"
    #                    ,samesite='None'
    #                    ,secure=True)
    resp.set_cookie("session_id", "", 0, 0, "/", secure=True, samesite='None')
    return resp


@app.route('/Posts/', methods=['GET', 'POST'])
def manage_posts():
    if request.method == 'GET':
        posts = get_all_posts()
        return posts
    else:
        return add_post()


def get_all_posts():
    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id is None:
        abort(401, "Please reconnect to see posts")
    db = pool.get_connection()
    query = "SELECT p.id, p.title, i.image, p.body, p.user_id, p.publish_at, u.username, COUNT(c.id) AS comment_count FROM posts p LEFT JOIN images i ON p.image_id = i.id LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON c.post_id = p.id GROUP BY p.id, p.title, i.image, p.body, p.user_id, p.publish_at, u.username;"

    data = []
    cursor = db.cursor()
    cursor.execute(query)
    records = cursor.fetchall()
    cursor.close()
    header = ['id', 'title', 'image_path', 'body', 'user_id', 'publish_at', 'posted_by', 'comments_count']
    db.close()

    for r in records:
        record = list(r)
        record[5] = record[5].strftime('%Y-%m-%d %H:%M:%S')
        data.append(dict(zip(header, record)))

    return json.dumps(data, default=str)


@app.route('/post/<int:id>', methods=['GET'])
def get_post(id):
    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id is None:
        # db.close()
        abort(401, "Please reconnect to see posts")
    checkLogged = True
    db = pool.get_connection()
    query = "SELECT p.id AS post_id,p.title, p.image_id, p.body, p.user_id AS post_user_id,p.publish_at,i.image, u.username AS post_username,c.id AS comment_id,c.comment, c.created_at,cu.username AS comment_username FROM posts p LEFT JOIN images i ON p.image_id = i.id LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON c.post_id = p.id LEFT JOIN users cu ON c.user_id = cu.id WHERE p.id = %s;"
    values = (id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    records = cursor.fetchall()
    print(records)
    cursor.close()

    query = "SELECT u.username FROM users u LEFT JOIN session s ON u.id = s.id WHERE s.session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    current_username = cursor.fetchone()
    cursor.close()
    db.close()

    post_data = records[0]
    post_header = ['post_id', 'title', 'image_id', 'body', 'post_user_id', 'publish_at', 'image', 'post_username']
    post_data = list(post_data)
    post_data[5] = post_data[5].strftime('%Y-%m-%d %H:%M:%S')
    post_data_dict = dict(zip(post_header, post_data))

    # Extract comments data from the remaining records
    comment_header = ['comment_id', 'comment_body', 'created_at', 'comment_username', 'isOwnerComment']
    comments_data = []
    if records[0][8:][0] is not None:
        for record in records:
            comment_data = list(record[8:])
            comment_data[2] = comment_data[2].strftime('%Y-%m-%d %H:%M:%S')
            is_owner_comment = comment_data[3] == current_username[0]  # Check if comment_username matches post_username
            comment_data.append(is_owner_comment)
            comments_data.append(dict(zip(comment_header, comment_data)))

    result = {'post': post_data_dict, 'comments': comments_data, 'checkLogged': checkLogged}
    return json.dumps(result)


def add_post():
    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id is None:
        abort(401, "Please reconnect to see posts")

    s3_bucket_name = bucket_name
    s3_access_key = aws_access_key_id
    s3_secret_key = aws_secret_access_key
    s3_region = 'eu-central-1'

    title = request.form.get('title')
    body = request.form.get('body')
    image = request.files.get('image')

    db = pool.get_connection()

    get_user_id_query = "select id from session where session_id= %s"
    get_user_id_values = (session_id,)
    cursor = db.cursor()
    cursor.execute(get_user_id_query, get_user_id_values)
    id_record = cursor.fetchall()
    db.commit()
    cursor.close()

    if image and allowed_file(image.filename):
        try:
            s3 = boto3.client(
                's3',
                aws_access_key_id=s3_access_key,
                aws_secret_access_key=s3_secret_key,
                region_name=s3_region
            )
            s3.upload_fileobj(image, s3_bucket_name, image.filename)
            image_url = f"https://{s3_bucket_name}.s3.{s3_region}.amazonaws.com/{image.filename}"
            print(image_url)
            insert_image_query = "INSERT INTO images (image) VALUES (%s)"
            insert_image_values = (image_url,)
            cursor = db.cursor()
            cursor.execute(insert_image_query, insert_image_values)
            image_id = cursor.lastrowid
            cursor.close()
            db.commit()

            insert_post_query = "INSERT INTO posts (title, body, image_id,user_id, publish_at) VALUES (%s, %s,%s, %s, NOW())"
            insert_post_values = (title, body, image_id, id_record[0][0])
            cursor = db.cursor()
            cursor.execute(insert_post_query, insert_post_values)
            db.commit()
            new_post_id = cursor.lastrowid
            cursor.close()
            db.close()
            new_post = get_post(new_post_id)
            return jsonify(new_post)

        except NoCredentialsError:
            return "AWS credentials not available."
    else:
        insert_post_query = "INSERT INTO posts (title, body,user_id, publish_at) VALUES (%s, %s,%s, NOW())"
        insert_post_values = (title, body, id_record[0][0])
        cursor = db.cursor()
        cursor.execute(insert_post_query, insert_post_values)
        db.commit()
        new_post_id = cursor.lastrowid
        cursor.close()
        db.close()
        new_post = get_post(new_post_id)
        resp = make_response(jsonify(new_post))
        return resp


@app.route('/add_comment', methods=['POST'])
def add_comment():
    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id is None:
        abort(401, "Please reconnect to see posts")

    db = pool.get_connection()
    get_user_id_query = "SELECT id FROM session WHERE session_id = %s"
    get_user_id_values = (session_id,)
    cursor = db.cursor()
    cursor.execute(get_user_id_query, get_user_id_values)
    user_id = cursor.fetchone()
    db.commit()
    cursor.close()
    payload = request.json
    post_id = payload.get('post_id')
    comment = payload.get('comment')

    if is_valid_post_id(post_id):
        insert_comment_query = "INSERT INTO comments (post_id, user_id, comment, created_at) VALUES (%s, %s, %s, NOW())"
        insert_comment_values = (post_id, user_id[0], comment)
        cursor = db.cursor()
        cursor.execute(insert_comment_query, insert_comment_values)
        db.commit()

        commentId = cursor.lastrowid

        get_comment_query = "SELECT comment,user_id FROM comments WHERE id = %s"
        get_comment_values = (commentId,)
        cursor.execute(get_comment_query, get_comment_values)
        new_comment = cursor.fetchone()

        get_user_query = "SELECT username FROM users WHERE id = %s"
        get_user_values = (user_id[0],)
        cursor.execute(get_user_query, get_user_values)
        username = cursor.fetchone()
        cursor.close()
        db.close()

        resp = make_response(jsonify({
            "comment": new_comment[0],
            "username": username[0],
            "commentId": commentId
        }))
        return resp
    db.close()
    resp = make_response()
    resp.status_code = 404
    return resp


def is_valid_post_id(post_id):
    if str(post_id).isdigit():
        db = pool.get_connection()
        insert_post_query = "select id from posts where id= %s"
        insert_post_values = (post_id,)
        cursor = db.cursor()
        cursor.execute(insert_post_query, insert_post_values)
        db.commit()
        new_post_id = cursor.fetchone
        cursor.close()
        db.close()
        if new_post_id != None:
            return True
        return False


@app.route('/getallcomments/<int:id>', methods=['GET'])
def get_all_comments(id):
    session_id = request.cookies.get('session_id')
    if session_id is None or is_session_expired(session_id):
        abort(401, "Please reconnect to see posts")
    if str(id).isdigit():
        db = pool.get_connection()
        query = "SELECT c.id, c.comment, c.created_at, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = %s"
        data = []
        cursor = db.cursor()
        cursor.execute(query, (id,))
        records = cursor.fetchall()
        cursor.close()
        header = ['id', 'comment', 'created_at', 'username']
        db.close()
        for r in records:
            record = list(r)
            record[2] = record[2].strftime('%Y-%m-%d %H:%M:%S')
            data.append(dict(zip(header, record)))

        return jsonify(data)
    else:
        return jsonify(error='Invalid post ID')


@app.route('/removecomment/<int:post_id>/<int:comment_id>', methods=['DELETE'])
def remove_comment(post_id, comment_id):
    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id is None:
        abort(401, "Please reconnect")
    db = pool.get_connection()
    query = "SELECT id FROM session WHERE session_id = %s "
    insert_values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, insert_values)
    user_id = cursor.fetchone()
    cursor.close()
    db.commit()

    query = "SELECT post_id,user_id FROM comments WHERE id= %s AND user_id =%s "
    cursor = db.cursor()
    cursor.execute(query, (str(comment_id), user_id[0]))
    post_id_and_user_id = cursor.fetchall()
    cursor.close()
    db.commit()

    if post_id_and_user_id != [] and post_id_and_user_id[0][0] == post_id and post_id_and_user_id[0][1] == user_id[0]:
        try:
            delete_query = "DELETE FROM comments WHERE id = %s"
            cursor = db.cursor()
            cursor.execute(delete_query, (str(comment_id),))
            cursor.close()
            db.commit()
            db.close()
            resp = make_response(jsonify({"massage": "Comment removed successfully!"}))
            return resp
        except mysql.connector.Error as error:
            # Handle any potential database errors
            resp = make_response(jsonify({"massage": error}))
            return resp
    db.close()
    resp = make_response(jsonify({"message": "illegal"}))
    resp.status_code = 400
    return resp


@app.route('/remove_post/<int:post_id>', methods=['POST'])
def remove_post(post_id):
    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id is None:
        abort(401, "Please reconnect")
    db = pool.get_connection()
    query = "SELECT id FROM session WHERE session_id = %s "
    insert_values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, insert_values)
    user_id = cursor.fetchone()
    cursor.close()
    db.commit()

    query = "SELECT user_id FROM posts WHERE id= %s"
    cursor = db.cursor()
    cursor.execute(query, (str(post_id),))
    post_user_id = cursor.fetchone()
    cursor.close()
    db.commit()

    if user_id != [] and post_user_id[0] == user_id[0]:
        try:
            delete_query = "DELETE FROM comments WHERE post_id = %s"
            cursor = db.cursor()
            cursor.execute(delete_query, (str(post_id),))
            cursor.close()
            db.commit()

            get_image_id_query = "SELECT image_id FROM posts WHERE id =%s"
            cursor = db.cursor()
            cursor.execute(get_image_id_query, (str(post_id),))
            image_id = cursor.fetchone()

            delete_query = "DELETE FROM posts WHERE user_id = %s AND id= %s"
            cursor = db.cursor()
            cursor.execute(delete_query, (str(post_user_id[0]), str(post_id)))
            cursor.close()
            db.commit()

            delete_query = "DELETE FROM images WHERE id = %s"
            cursor = db.cursor()
            cursor.execute(delete_query, (image_id[0],))
            cursor.close()
            db.commit()

            db.close()
            resp = make_response(jsonify({"massage": "post removed successfully!"}))
            return resp

        except mysql.connector.Error as error:
            resp = make_response(jsonify({"massage": error}))
            return resp
    db.close()
    resp = make_response(jsonify({"message": "illegal"}))
    resp.status_code = 400
    return resp


@app.route('/edit_post/<int:post_id>', methods=['POST'])
def edit_post(post_id):
    data = request.get_json()
    edited_post_title = data['title']
    edited_post_content = data['content']

    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id is None:
        abort(401, "Please reconnect")
    db = pool.get_connection()
    query = "SELECT id FROM session WHERE session_id = %s "
    insert_values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, insert_values)
    user_id = cursor.fetchone()
    cursor.close()
    db.commit()

    query = "SELECT user_id FROM posts WHERE id= %s"
    cursor = db.cursor()
    cursor.execute(query, (str(post_id),))
    post_user_id = cursor.fetchone()
    cursor.close()
    db.commit()

    if user_id != [] and post_user_id[0] == user_id[0]:
        try:
            update_query = "UPDATE posts SET title = %s, body= %s WHERE id = %s"
            cursor = db.cursor()
            cursor.execute(update_query, (edited_post_title, edited_post_content, str(post_id)))
            cursor.close()
            db.commit()
            db.close()
            resp = make_response(jsonify({"massage": "post edited successfully!"}))
            return resp

        except mysql.connector.Error as error:
            resp = make_response(jsonify({"massage": error}))
            return resp
    db.close()
    resp = make_response(jsonify({"message": "illegal"}))
    resp.status_code = 400
    return resp


@app.route('/editcomment/<int:post_id>/<int:comment_id>', methods=['PUT'])
def edit_comment(post_id, comment_id):
    data = request.get_json()
    edited_comment_body = data['body']

    session_id = request.cookies.get('session_id')
    if is_session_expired(session_id) or session_id is None:
        abort(401, "Please reconnect")
    db = pool.get_connection()
    query = "SELECT id FROM session WHERE session_id = %s "
    insert_values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, insert_values)
    user_id = cursor.fetchone()
    cursor.close()
    db.commit()

    query = "SELECT user_id FROM posts WHERE id= %s"
    cursor = db.cursor()
    cursor.execute(query, (str(post_id),))
    post_user_id = cursor.fetchone()
    cursor.close()
    db.commit()

    if user_id != [] and post_user_id[0] == user_id[0]:
        try:
            update_query = "UPDATE comments SET comment= %s WHERE post_id = %s AND id = %s"
            cursor = db.cursor()
            cursor.execute(update_query, (str(edited_comment_body), str(post_id), str(comment_id)))
            cursor.close()
            db.commit()
            db.close()
            resp = make_response(jsonify({"massage": "comment edited successfully!"}))
            return resp

        except mysql.connector.Error as error:
            error_message = str(error)
            resp = make_response(jsonify({"massage": error}))
            return resp
    db.close()
    resp = make_response(jsonify({"message": "illegal"}))
    resp.status_code = 400
    return resp


if __name__ == "__main__":
    app.run()
