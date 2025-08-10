// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import UserTable from './UserTable'; // Убедись, что путь к компоненту правильный
import Login from './Login'; // Импортируем компонент входа
import Register from './Register'; // Импортируем компонент регистрации
import ThemesList from './ThemesList'; // Импортируем компонент для тем

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Состояние для управления активной "страницей"
  // По умолчанию 'home', чтобы сразу показывались темы
  const [activeView, setActiveView] = useState('home');

  // Данные для категорий (временно не используются напрямую, если home = ThemesList)
  // Можно оставить для потенциального использования в поиске или других разделах
  const categories = [
    {
      id: 'films',
      title: 'Фильмы',
      icon: '🎬',
      subcategories: [
        {
          id: 'horror',
          title: 'Ужасы',
          threads: [
            { id: 1, title: 'Лучшие хорроры 2023', posts: 142 },
            { id: 2, title: 'Классика жанра', posts: 89 },
            { id: 3, title: 'Азиатские ужасы', posts: 67 }
          ]
        },
        {
          id: 'comedy',
          title: 'Комедии',
          threads: [
            { id: 1, title: 'Новые комедии', posts: 112 },
            { id: 2, title: 'Чёрный юмор', posts: 54 }
          ]
        },
        {
          id: 'fantasy',
          title: 'Фэнтези',
          threads: [
            { id: 1, title: 'Фэнтези 2023', posts: 78 },
            { id: 2, title: 'Эпическое фэнтези', posts: 92 }
          ]
        }
      ]
    },
    {
      id: 'games',
      title: 'Игры',
      icon: '🎮',
      subcategories: [
        {
          id: 'rpg',
          title: 'RPG',
          threads: [
            { id: 1, title: 'Skyrim моды', posts: 342 },
            { id: 2, title: 'The Witcher 4', posts: 287 },
            { id: 3, title: 'Лучшие RPG 2023', posts: 156 }
          ]
        },
        {
          id: 'shooters',
          title: 'Шутеры',
          threads: [
            { id: 1, title: 'CS2 обсуждение', posts: 512 },
            { id: 2, title: 'Новые кооперативные шутеры', posts: 124 }
          ]
        }
      ]
    },
    {
      id: 'books',
      title: 'Книги',
      icon: '📚',
      subcategories: [
        {
          id: 'fantasy',
          title: 'Фэнтези',
          threads: [
            { id: 1, title: 'Новинки фэнтези', posts: 87 },
            { id: 2, title: 'Классика жанра', posts: 65 }
          ]
        }
      ]
    }
  ];

  // Фильтрация данных по поиску (может понадобиться позже)
  const filterData = () => {
    if (!searchQuery) return categories;

    const query = searchQuery.toLowerCase();
    return categories
        .map(category => ({
          ...category,
          subcategories: category.subcategories
              .map(subcategory => ({
                ...subcategory,
                threads: subcategory.threads?.filter(thread => // Добавлено ?. на случай отсутствия threads
                    thread.title.toLowerCase().includes(query)
                ) || [] // Добавлено || [] на случай отсутствия threads
              }))
              .filter(subcategory => subcategory.threads?.length > 0) // Добавлено ?.length
        }))
        .filter(category => category.subcategories.length > 0);
  };

  const filteredCategories = filterData();

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
            <li className={activeView === 'users' ? 'active' : ''} onClick={() => setActiveView('users')}>
              <div className="menu-icon">👥</div>
              <span>Пользователи</span>
            </li>
            {/* Пункт "Темы" - можно оставить или убрать, если дублирует Главную */}
            {/* В данном случае, он тоже ведет на ThemesList */}
            <li className={activeView === 'themes' ? 'active' : ''} onClick={() => setActiveView('themes')}>
              <div className="menu-icon">📂</div>
              <span>Темы</span>
            </li>
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
            {/* Условный рендеринг: если 'home' или 'themes', показываем список тем */}
            {(activeView === 'home' || activeView === 'themes') ? (
                <ThemesList />
            ) : activeView === 'users' ? (
                <UserTable />
            ) : activeView === 'login' ? (
                <Login />
            ) : activeView === 'register' ? (
                <Register />
            ) : (
                // Для остальных (search, members и т.д.) показываем заглушку или другое содержимое
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