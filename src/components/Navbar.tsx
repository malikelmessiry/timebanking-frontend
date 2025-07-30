import { Link } from 'react-router-dom';

export default function Navbar() {

    return (
        <nav className='navbar'>
            <div className='nav-container'>
                <Link to="/dashboard" className='nav-brand'>TimeBank</Link>
                <div className='nav-links'>
                    <Link to="/dashboard" className='nav-link'>Dashboard</Link>
                    <Link to="/discover" className='nav-link'>Discover</Link>
                    <Link to="/profile" className='nav-link'>Profile</Link>
                </div>
            </div>
        </nav>
    );
}