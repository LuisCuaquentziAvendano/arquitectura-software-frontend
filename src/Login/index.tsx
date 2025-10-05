import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { API_URL, formatError } from '../utils';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import './index.css';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = isSignup
      ? { name, email, password }
      : { email, password };
    const url = isSignup
      ? `${API_URL}/users/signup`
      : `${API_URL}/users/login`
    axios.post(url, body)
    .then(res => {
      localStorage.setItem('authorization', `Bearer ${res.data.authorization}`);
      navigate('/games');
    }).catch((res: AxiosError) => {
      formatError(res);
    });
  };

  return (
    <div className='container vertical-flex'>
      <div className='card'>
        <Header />
        <br />
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
          <button type='submit'>
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
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
