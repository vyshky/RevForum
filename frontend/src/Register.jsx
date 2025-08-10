// src/Register.jsx
import React, { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Для сообщения об успехе
  const [isLoading, setIsLoading] = useState(false); // Индикатор загрузки

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Базовая валидация на фронтенде
    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов.');
      setIsLoading(false);
      return;
    }
    // Добавь другие проверки при необходимости (например, валидация email)

    try {
      // Отправляем POST-запрос на API регистрации
      const response = await fetch('http://localhost:8080/api/register', { // Убедись в правильности URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Если у тебя уже есть JWT и требуется авторизация для регистрации (редко), добавь его в headers
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, password }), // Отправляем данные в JSON
      });

      const data = await response.json();

      if (response.ok) {
        // Регистрация успешна (статус 201)
        console.log('Успешная регистрация:', data);
        setSuccess(data.message || 'Пользователь успешно зарегистрирован!');
        // Опционально: сбросить форму
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Опционально: перенаправить на страницу входа или в основное приложение
        // navigate('/login'); // если используешь react-router-dom v6
      } else {
        // Сервер вернул ошибку (статус 4xx, 5xx)
        console.error('Ошибка регистрации:', data);
        // Предполагаем, что сервер возвращает объект { error: "..." }
        setError(data.error || `Ошибка регистрации: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      // Ошибка сети или другая ошибка fetch
      console.error('Ошибка сети при регистрации:', err);
      setError('Не удалось подключиться к серверу. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-area auth-container">
      <h2>Регистрация</h2>
      {/* Отображаем ошибки */}
      {error && <div className="auth-error">{error}</div>}
      {/* Отображаем сообщение об успехе */}
      {success && <div className="auth-success">{success}</div>}
      {/* Форма */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="register-username">Имя пользователя:</label>
          <input
            type="text"
            id="register-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-email">Email:</label>
          <input
            type="email"
            id="register-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password">Пароль:</label>
          <input
            type="password"
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-confirm-password">Подтвердите пароль:</label>
          <input
            type="password"
            id="register-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading} className="auth-button">
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default Register;