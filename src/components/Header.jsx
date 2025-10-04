import React from 'react'
import Image from '../user.jpg';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const handleLogout = (e) => {
      e.preventDefault();
       localStorage.removeItem("token");
       navigate("/");
    }
  return (
    
    <>
      <div >
        <header className="d-flex flex-wrap justify-content-center py-1 border-bottom">
          <a
            href="/"
            className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
          >
            {/* <svg className="bi me-2" width="40" height="32"></svg>   */}
            <span className="fs-4">Admin Panel</span>
          </a>
          <div className='pe-5'>
            <img src={Image} alt="Logo" className='shadow p-2' style={{ width: '50px', borderRadius: '50%'}}/>
            <button className='btn btn-light' onClick={handleLogout}>logout</button>
          </div>
        </header>
      </div>
    </>
  )
}

export default Header
