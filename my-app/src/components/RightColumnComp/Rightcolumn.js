import LatestBlogs from './LatestBlogs'
import PopularBlogs from './PopularBlogs'

function Rightcolumn(){
    return (
    <div className="column rightcolumn">
        <PopularBlogs />
        <LatestBlogs />
    </div>
    );
}
export default Rightcolumn;