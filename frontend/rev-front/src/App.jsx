// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import UserTable from './UserTable'; // Убедись, что путь к компоненту правильный
import Login from './Login'; // Импортируем компонент входа
import Register from './Register'; // Импортируем компонент регистрации

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Состояние для управления активной "страницей" (теперь включает 'login' и 'register')
  const [activeView, setActiveView] = useState('home');

  // Данные для категорий (остаются без изменений)
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

  // Фильтрация данных по поиску (остается без изменений)
  const filterData = () => {
    if (!searchQuery) return categories;

    const query = searchQuery.toLowerCase();
    return categories
      .map(category => ({
        ...category,
        subcategories: category.subcategories
          .map(subcategory => ({
            ...subcategory,
            threads: subcategory.threads.filter(thread =>
              thread.title.toLowerCase().includes(query)
            )
          }))
          .filter(subcategory => subcategory.threads.length > 0)
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
          {/* Пункт "Главная" */}
          <li className={activeView === 'home' ? 'active' : ''} onClick={() => setActiveView('home')}>
            <div className="menu-icon">🏠</div>
            <span>Главная</span>
          </li>
          {/* Пункт "Поиск" */}
          <li className={activeView === 'search' ? 'active' : ''} onClick={() => setActiveView('search')}>
            <div className="menu-icon">🔍</div>
            <span>Поиск</span>
          </li>
          {/* Пункт "Участники" */}
          <li className={activeView === 'members' ? 'active' : ''} onClick={() => setActiveView('members')}>
            <div className="menu-icon">👥</div>
            <span>Участники</span>
          </li>
          {/* Пункт "Рейтинги" */}
          <li className={activeView === 'ratings' ? 'active' : ''} onClick={() => setActiveView('ratings')}>
            <div className="menu-icon">📊</div>
            <span>Рейтинги</span>
          </li>
          {/* Пункт "Настройки" */}
          <li className={activeView === 'settings' ? 'active' : ''} onClick={() => setActiveView('settings')}>
            <div className="menu-icon">⚙️</div>
            <span>Настройки</span>
          </li>
          {/* Разделитель */}
          <div className="divider"></div>
          {/* Пункт "Пользователи" - добавлен обработчик и класс активности */}
          <li className={activeView === 'users' ? 'active' : ''} onClick={() => setActiveView('users')}>
            <div className="menu-icon">👥</div>
            <span>Пользователи</span>
          </li>
          {/* Пункт "Регистрация" - обновлен обработчик и класс активности */}
          <li className={activeView === 'register' ? 'active' : ''} onClick={() => setActiveView('register')}>
            <div className="menu-icon">📝</div>
            <span>Регистрация</span>
          </li>
          {/* Пункт "Войти" - обновлен обработчик и класс активности */}
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

        {/* Основное содержимое - условный рендеринг для разных "страниц" */}
        <main className="main-content-wrapper">
          {/* Условный рендеринг: проверяем activeView и отображаем соответствующий компонент */}
          {activeView === 'users' ? (
            <UserTable />
          ) : activeView === 'login' ? (
            <Login />
          ) : activeView === 'register' ? (
            <Register />
          ) : (
            // Иначе показываем основной контент форума (home, search и т.д.)
            <section className="content-area">
              {filteredCategories.map(category => (
                <div key={category.id} className="category-section">
                  <div className="category-header">
                    <div className="category-icon">{category.icon}</div>
                    <h2>{category.title}</h2>
                  </div>

                  <div className="subcategories-container">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="subcategory-card">
                        <div className="subcategory-header">
                          <h3>{subcategory.title}</h3>
                          <div className="thread-count">
                            Тем: {subcategory.threads.length}
                          </div>
                        </div>

                        <ul className="threads-list">
                          {subcategory.threads.map(thread => (
                            <li key={thread.id} className="thread-item">
                              <div className="thread-icon">💬</div>
                              <div className="thread-info">
                                <div className="thread-title">{thread.title}</div>
                                <div className="thread-stats">
                                  Сообщений: {thread.posts}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;