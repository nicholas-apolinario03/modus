import { Link } from "react-router-dom";
export default function Home(){

    return(
        <header>
            <nav>
             <Link to="/login">Login</Link>
             <Link to="/dashboard">Dashboard</Link>
            </nav>
        </header>
    );

}