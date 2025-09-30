import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import { getApiUrl, statusOk } from '../utils';
import { Link } from 'react-router-dom';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = isSignup
      ? { name, email, password }
      : { email, password };
    const url = isSignup
      ? `${getApiUrl()}/users/signup`
      : `${getApiUrl()}/users/login`
    try {
      console.log(getApiUrl());
      const res = await axios.post(url, payload);
      if (!statusOk(res.status)) {
        if (res.status == 400)
          alert('Contraseña inválida');
        if (res.status == 401)
          alert('Email o contraseña inválida');
        return;
      }
      localStorage.setItem('authorization', `Bearer ${res.data.authorization}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='container vertical-flex'>
      <div className='card'>
        <h1>GAME HUB</h1>
        <h2>{isSignup ? 'Sign up' : 'Login'}</h2>
        <form onSubmit={handleSubmit} className='vertical-flex'>
          {isSignup && (
            <input
              type='text'
              placeholder='Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Link to="/games">
            <button type='submit'>
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </Link>
        </form>
        <p className='toggle-text'>
          {isSignup ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
          <span className='link' onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Login' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
