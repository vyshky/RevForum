import React, { useState } from 'react';
import './Forum.css';

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Данные для категорий
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

  // Фильтрация данных по поиску
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
          <li className="active">
            <div className="menu-icon">🏠</div>
            <span>Главная</span>
          </li>
          <li>
            <div className="menu-icon">🔍</div>
            <span>Поиск</span>
          </li>
          <li>
            <div className="menu-icon">👥</div>
            <span>Участники</span>
          </li>
          <li>
            <div className="menu-icon">📊</div>
            <span>Рейтинги</span>
          </li>
          <li>
            <div className="menu-icon">⚙️</div>
            <span>Настройки</span>
          </li>
          
          <div className="divider"></div>
          
          <li>
            <div className="menu-icon">📝</div>
            <span>Регистрация</span>
          </li>
          <li>
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

        {/* Основное содержимое */}
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
      </div>
    </div>
  );
};

export default Forum;