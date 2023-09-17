import {useEffect, useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function GoogleLoginv2({setUserImage}) {
    const navigate = useNavigate();
    const decodeJwtResponse = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
function handleCredentialResponse(response) {
     const responsePayload = decodeJwtResponse(response.credential);
     if (responsePayload.email !== "") {
         const url = "/Oauth/callback"
         const data = {
             user: responsePayload.name,
             image: responsePayload.picture,
             email: responsePayload.email
         }
         axios.post(url, data, {withCredentials: true})
             .then((res) => {
                 if (res.status === 200) {
                    setUserImage(responsePayload.picture);
                    window.location.reload();
                 }
             })
             .catch((err) => {
                 console.error(err);
             });
     }else{
         console.log("error in Oauth")
     }
  }

    useEffect(() => {
        /* global google */
        google.accounts.id.initialize({
            client_id: "713597538542-6gupfe76rn0ocdci2rg44an62drsgesc.apps.googleusercontent.com",
            callback: response => handleCredentialResponse(response),
        });
        google.accounts.id.renderButton(
            document.getElementById("signInDiv"),
            {theme: "outline",size: "large"});
    }, []);


    return (
        <div className="GoogleLogin">
            <div id="signInDiv"></div>
        </div>

    );
}

export default GoogleLoginv2