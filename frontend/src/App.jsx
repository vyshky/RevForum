// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import Login from './Login'; // Импортируем компонент входа
import Register from './Register'; // Импортируем компонент регистрации
import ThemesList from './ThemesList'; // Импортируем компонент для тем

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Состояние для управления активной "страницей"
  // По умолчанию 'home', чтобы сразу показывались темы
  const [activeView, setActiveView] = useState('home');

  // Удалены статические данные categories

  // Функция filterData удалена, так как категории больше не используются статически
  // const filterData = () => { ... }

  // Удалена константа filteredCategories
  // const filteredCategories = filterData();

  return (
      <div className="forum-container">
        {/* Левое меню */}
        <nav className="sidebar">
          <div className="logo">Форум</div>
          <ul>
            {/* Пункт "Главная" - теперь отображает темы */}
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
            {/* Пункты "Темы" и "Пользователи" УДАЛЕНЫ */}
            <li className={activeView === 'register' ? 'active' : ''} onClick={() => setActiveView('register')}>
              <div className="menu-icon">📝</div>
              <span>Регистрация</span>
            </li>
            <li className={activeView === 'login' ? 'active' : ''} onClick={() => setActiveView('login')}>
              <div className="menu-icon">🔑</div>
              <span>Войти</span>
            </li>
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
              <span>Гость</span>
            </div>
          </header>

          {/* Основное содержимое - обновлено условное рендеринг */}
          <main className="main-content-wrapper">
            {/* Условный рендеринг: если 'home', показываем список тем */}
            {/* Убрана проверка activeView === 'themes' */}
            {activeView === 'home' ? (
                <ThemesList />
            ) : activeView === 'login' ? (
                <Login />
            ) : activeView === 'register' ? (
                <Register />
            ) : (
                // Для остальных (search, members, ratings, settings) показываем заглушку
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