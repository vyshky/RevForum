// src/ThemesList.jsx
import React, { useState, useEffect } from 'react';

const ThemesList = () => {
    const [themes, setThemes] = useState([]); // Состояние для хранения списка тем
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки списка тем
    const [error, setError] = useState(null); // Состояние для отслеживания ошибок загрузки списка тем

    // Состояния для формы создания темы
    const [newThemeTitle, setNewThemeTitle] = useState('');
    const [newThemeStatus, setNewThemeStatus] = useState('Активна'); // Значение по умолчанию
    const [isCreating, setIsCreating] = useState(false); // Состояние для отслеживания процесса создания
    const [createError, setCreateError] = useState(null); // Состояние для ошибок создания
    const [createSuccess, setCreateSuccess] = useState(false); // Состояние для сообщения об успехе

    // Функция для получения данных о темах из API
    const fetchThemes = async () => {
        try {
            setLoading(true);
            setError(null); // Сброс ошибки перед новой попыткой
            const response = await fetch('http://localhost:8080/api/themes'); // Убедись, что URL правильный

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Message: ${errorText || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Fetched themes:', data);
            setThemes(data);
        } catch (err) {
            console.error('Fetch error (Themes):', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // useEffect для загрузки тем при монтировании компонента
    useEffect(() => {
        fetchThemes();
    }, []);

    // Функция для обработки отправки формы создания темы
    const handleCreateTheme = async (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы

        // Базовая валидация
        if (!newThemeTitle.trim()) {
            setCreateError('Название темы не может быть пустым.');
            return;
        }

        setIsCreating(true);
        setCreateError(null);
        setCreateSuccess(false);

        try {
            // Отправляем POST-запрос на API для создания темы
            const response = await fetch('http://localhost:8080/api/themes/create', { // Убедись, что URL правильный
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Если потребуется аутентификация, добавь токен:
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newThemeTitle,
                    status: newThemeStatus
                    // ID и CreatedAt не отправляются, сервер их генерирует
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Успешное создание
                console.log('Theme created:', data);
                setCreateSuccess(true);
                // Сброс формы
                setNewThemeTitle('');
                setNewThemeStatus('Активна');
                // Обновляем список тем
                fetchThemes(); // Простой способ - перезагрузить список
                // Или можно добавить новую тему в состояние напрямую:
                // setThemes(prevThemes => [...prevThemes, data.theme]); // если API возвращает созданную тему
            } else {
                // Ошибка от сервера
                console.error('Error creating theme:', data);
                setCreateError(data.error || `Ошибка создания темы: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            // Ошибка сети или другая ошибка fetch
            console.error('Network error creating theme:', err);
            setCreateError('Не удалось подключиться к серверу. Попробуйте позже.');
        } finally {
            setIsCreating(false);
        }
    };

    if (loading && themes.length === 0) return <div className="content-area"><p>Загрузка тем...</p></div>; // Показываем загрузку только если список еще пуст
    if (error) return <div className="content-area"><p style={{ color: 'red' }}>Ошибка загрузки тем: {error}</p></div>;

    return (
        <div className="content-area">
            <h2>Темы форума</h2>

            {/* Форма создания новой темы */}
            <div className="create-theme-form-container" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Создать новую тему</h3>
                {createSuccess && <p style={{ color: 'green' }}>Тема успешно создана!</p>}
                {createError && <p style={{ color: 'red' }}>{createError}</p>}
                <form onSubmit={handleCreateTheme} className="create-theme-form">
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label htmlFor="new-theme-title" style={{ display: 'block', marginBottom: '5px' }}>Название темы:</label>
                        <input
                            type="text"
                            id="new-theme-title"
                            value={newThemeTitle}
                            onChange={(e) => setNewThemeTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label htmlFor="new-theme-status" style={{ display: 'block', marginBottom: '5px' }}>Статус:</label>
                        <select
                            id="new-theme-status"
                            value={newThemeStatus}
                            onChange={(e) => setNewThemeStatus(e.target.value)}
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        >
                            <option value="Активна">Активна</option>
                            <option value="Архивирована">Архивирована</option>
                            {/* Добавь другие возможные статусы, если нужно */}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: isCreating ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: isCreating ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isCreating ? 'Создание...' : 'Создать тему'}
                    </button>
                </form>
            </div>

            <hr style={{ margin: '20px 0' }} /> {/* Разделитель */}

            {/* Список тем */}
            <h3>Существующие темы</h3>
            {loading && themes.length > 0 && <p>Обновление списка...</p>} {/* Индикатор обновления, если список уже есть */}
            {themes.length > 0 ? (
                <ul>
                    {themes.map((theme) => (
                        <li key={theme.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '3px' }}>
                            <strong>{theme.title}</strong>
                            <span style={{ marginLeft: '10px', fontStyle: 'italic', color: theme.status === 'Активна' ? 'green' : 'orange' }}>
                ({theme.status})
              </span>
                            {theme.created_at && (
                                <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                  Создано: {new Date(theme.created_at).toLocaleDateString()}
                </span>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Темы не найдены.</p>
            )}
        </div>
    );
};

export default ThemesList;