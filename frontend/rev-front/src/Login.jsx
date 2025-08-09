// src/Login.jsx
import React, { useState } from 'react';

// Предполагается, что у тебя есть способ передать информацию об успешном логине в App.jsx
// Например, через пропс или через контекст. Пока оставим это в виде TODO комментария.
const Login = ({ onLoginSuccess }) => { // Принимаем пропс onLoginSuccess из App
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Для отображения ошибок
  const [isLoading, setIsLoading] = useState(false); // Индикатор загрузки

  // Создаем функцию handleSubmit для обработки отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем стандартную отправку формы браузером
    setError(''); // Сбрасываем предыдущие ошибки
    setIsLoading(true); // Включаем индикатор загрузки

    // Базовая клиентская валидация (можно расширить)
    if (!username.trim() || !password) {
      setError('Пожалуйста, заполните все поля.');
      setIsLoading(false);
      return;
    }

    try {
      // Внутри handleSubmit используем fetch для POST запроса на /api/login
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // В будущем, если потребуется, сюда можно будет добавить токен
          // 'Authorization': `Bearer ${token}`
        },
        // Отправляем JSON { username, password }
        body: JSON.stringify({ username, password }),
      });

      // Получаем данные из ответа
      const data = await response.json();

      if (response.ok) {
        // Обработка ответа сервера при успехе
        console.log('Успешный вход:', data);
        
        // TODO: При успехе, сохранить токен и обновить состояние аутентификации
        // Предполагается, что сервер возвращает объект с токеном, например: { token: "..." }
        // localStorage.setItem('token', data.token); // Сохраняем токен в localStorage
        
        // Вызываем функцию из App, чтобы обновить состояние аутентификации
        // if (onLoginSuccess) {
        //   onLoginSuccess(data.user, data.token); // Передаем данные пользователя и токен
        // }
        
        // Или просто сообщаем об успехе
        alert(data.message || 'Вход выполнен успешно!');
        // Здесь можно перенаправить пользователя, например, на главную страницу
        // window.location.href = '/'; // Простой способ
        // Или использовать react-router, если он установлен: navigate('/');
        
      } else {
        // Обработка ответа сервера при ошибке (например, 401 Unauthorized)
        console.error('Ошибка входа:', data);
        // Предполагаем, что сервер возвращает объект { error: "..." }
        setError(data.error || `Ошибка входа: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      // Обработка сетевых ошибок или других исключений
      console.error('Ошибка сети при входе:', err);
      setError('Не удалось подключиться к серверу. Проверьте подключение и URL API.');
    } finally {
      // В любом случае, выключаем индикатор загрузки
      setIsLoading(false);
    }
  };

  return (
    <div className="content-area auth-container">
      <h2>Вход</h2>
      {/* Отображаем ошибки */}
      {error && <div className="auth-error">{error}</div>}
      {/* Форма с обработчиком onSubmit */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-username">Имя пользователя:</label>
          <input
            type="text"
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Пароль:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Добавляем type="submit" и onSubmit={handleSubmit} к кнопке/форме */}
        {/* Убираем type="button" и добавляем disabled во время загрузки */}
        <button type="submit" disabled={isLoading} className="auth-button">
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default Login;