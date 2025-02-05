import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'

const Signup = (props) => {
    const [credentials, setCredentials]=useState({name:"", email:"", password:"", cpassword:""})
    let navigate=useNavigate();
    const handleSubmit= async(e)=>{
        e.preventDefault();
        const {name, email, password}=credentials;
        const response = await fetch("http://localhost:5000/api/auth/createuser", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({name, email, password})
          });
      
          const json = await response.json(); 
          console.log(json);
          if(json.success){
            // Save the authtoken and redirect
            localStorage.setItem('token', json.authtoken);
            props.showAlert("Account created successfully", "success")
            navigate("/")
          }
          else{
            props.showAlert("Invalid details", "danger")
          }
    }

    const onChange = (e)=>{
        setCredentials({...credentials, [e.target.name]: e.target.value})
    }
  return (
    <div className='container my-2'>
      <h2>Let's start working with iNotebook</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="name" className="form-control" id="name" name='name' value={credentials.name} onChange={onChange} />
        </div>
        <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" name='email' value={credentials.email} onChange={onChange} aria-describedby="emailHelp" />
        </div>
        <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" name='password' value={credentials.password} onChange={onChange} minLength={5} required />
        </div>
        <div className="mb-3">
            <label htmlFor="cpassword" className="form-label">Confirm Password</label>
            <input type="password" className="form-control" id="cpassword" name='cpassword' value={credentials.cpassword} onChange={onChange} minLength={5} required />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
    </form>
    </div>
  )
}

export default Signup
