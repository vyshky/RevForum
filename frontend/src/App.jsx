// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';
import ThemesList from './ThemesList';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    validateAuth();
  }, []);

  const validateAuth = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/login/validate', {
        method: 'GET',
        credentials: 'include' // Важно для отправки куков
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.message);
      }
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveView('home');
  };

  const handleRegisterSuccess = (user) => {
    // После успешной регистрации перенаправляем на страницу входа
    setActiveView('login');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/login/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Всегда сбрасываем состояние пользователя, независимо от ответа сервера
      setCurrentUser(null);
      setActiveView('home');

      // Дополнительно удаляем куки на клиентской стороне
      document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    } catch (error) {
      console.error('Ошибка выхода:', error);
      // Даже если ошибка сети, все равно сбрасываем локальное состояние
      setCurrentUser(null);
      setActiveView('home');
      // Принудительно удаляем куки
      document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-2xl">Загрузка...</div>
        </div>
    );
  }

  return (
      <div className="forum-container">
        {/* Левое меню */}
        <nav className="sidebar">
          <div className="logo">Форум</div>
          <ul>
            <li className={activeView === 'home' ? 'active' : ''} onClick={() => setActiveView('home')}>
              <div className="menu-icon">🏠</div>
              <span>Главная</span>
            </li>
            <li className={activeView === 'search' ? 'active' : ''} onClick={() => setActiveView('search')}>
              <div className="menu-icon">🔍</div>
              <span>Поиск</span>
            </li>
            <li className={activeView === 'members' ? 'active' : ''} onClick={() => setActiveView('members')}>
              <div className="menu-icon">👥</div>
              <span>Участники</span>
            </li>
            <li className={activeView === 'ratings' ? 'active' : ''} onClick={() => setActiveView('ratings')}>
              <div className="menu-icon">📊</div>
              <span>Рейтинги</span>
            </li>
            <li className={activeView === 'settings' ? 'active' : ''} onClick={() => setActiveView('settings')}>
              <div className="menu-icon">⚙️</div>
              <span>Настройки</span>
            </li>
            <div className="divider"></div>

            {!currentUser ? (
                <>
                  <li className={activeView === 'register' ? 'active' : ''} onClick={() => setActiveView('register')}>
                    <div className="menu-icon">📝</div>
                    <span>Регистрация</span>
                  </li>
                  <li className={activeView === 'login' ? 'active' : ''} onClick={() => setActiveView('login')}>
                    <div className="menu-icon">🔑</div>
                    <span>Войти</span>
                  </li>
                </>
            ) : (
                <li onClick={handleLogout}>
                  <div className="menu-icon">🚪</div>
                  <span>Выйти</span>
                </li>
            )}
          </ul>
        </nav>

        <div className="main-content">
          {/* Хедер с поиском */}
          <header className="forum-header">
            <div className="search-container">
              <input
                  type="text"
                  placeholder="Поиск по форуму..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-button">🔍</button>
            </div>
            <div className="user-menu">
              <div className="user-avatar">👤</div>
              <span>{currentUser ? currentUser.Username : 'Гость'}</span>
            </div>
          </header>

          {/* Основное содержимое */}
          <main className="main-content-wrapper">
            {activeView === 'home' ? (
                <ThemesList />
            ) : activeView === 'login' ? (
                currentUser ? (
                    <div className="content-area">
                      <p>Вы уже вошли в систему как {currentUser.Username}</p>
                      <button onClick={() => setActiveView('home')}>Перейти на главную</button>
                    </div>
                ) : (
                    <Login onLoginSuccess={handleLoginSuccess} />
                )
            ) : activeView === 'register' ? (
                <Register onRegisterSuccess={handleRegisterSuccess} />
            ) : (
                <div className="content-area">
                  <p>Содержимое для раздела "{activeView}" будет добавлено позже.</p>
                </div>
            )}
          </main>
        </div>
      </div>
  );
};

export default App;