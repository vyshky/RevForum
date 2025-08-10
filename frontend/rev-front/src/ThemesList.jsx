// src/ThemesList.jsx
import React, { useState, useEffect } from 'react';
import SubThemesList from './SubThemesList'; // Импортируем новый компонент

const ThemesList = () => {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для модального окна создания темы
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newThemeTitle, setNewThemeTitle] = useState('');
    const [newThemeStatus, setNewThemeStatus] = useState('Активна');
    const [isCreating, setIsCreating] = useState(false);
    const [createMessage, setCreateMessage] = useState({ type: '', text: '' }); // { type: 'error' | 'success', text: '...' }

    // Состояние для управления отображением: список тем или подтемы конкретной темы
    const [selectedTheme, setSelectedTheme] = useState(null); // null - показывать список тем, объект - показывать подтемы

    // Функция для получения данных о темах из API
    const fetchThemes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:8080/api/themes');

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

    useEffect(() => {
        fetchThemes();
    }, []);

    // Функция для обработки отправки формы создания темы
    const handleCreateTheme = async (e) => {
        e.preventDefault();

        if (!newThemeTitle.trim()) {
            setCreateMessage({ type: 'error', text: 'Название темы не может быть пустым.' });
            return;
        }

        setIsCreating(true);
        setCreateMessage({ type: '', text: '' }); // Сброс сообщений

        try {
            // Убедись, что URL правильный (возможно, /api/themes без /create)
            const response = await fetch('http://localhost:8080/api/themes/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newThemeTitle,
                    status: newThemeStatus
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Theme created:', data);
                setCreateMessage({ type: 'success', text: 'Тема успешно создана!' });
                setNewThemeTitle('');
                setNewThemeStatus('Активна');
                fetchThemes();
                // Автоматически закрыть модальное окно через 1.5 секунды
                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setCreateMessage({ type: '', text: '' }); // Сброс сообщения при закрытии
                }, 1500);
            } else {
                console.error('Error creating theme:', data);
                setCreateMessage({ type: 'error', text: data.error || `Ошибка создания темы: ${response.status} ${response.statusText}` });
            }
        } catch (err) {
            console.error('Network error creating theme:', err);
            setCreateMessage({ type: 'error', text: 'Не удалось подключиться к серверу. Попробуйте позже.' });
        } finally {
            setIsCreating(false);
        }
    };

    // Функция для перехода к отображению подтем конкретной темы
    const handleViewSubThemes = (theme) => {
        setSelectedTheme(theme);
    };

    // Функция для возврата к списку тем
    const handleBackToThemes = () => {
        setSelectedTheme(null);
    };

    // Функции управления модальным окном
    const openCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateMessage({ type: '', text: '' }); // Сброс сообщений при открытии
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setNewThemeTitle('');
        setNewThemeStatus('Активна');
        setCreateMessage({ type: '', text: '' }); // Сброс сообщений при закрытии
    };

    // Если выбрана конкретная тема, отображаем SubThemesList
    if (selectedTheme) {
        return <SubThemesList themeId={selectedTheme.id} themeTitle={selectedTheme.title} onBack={handleBackToThemes} />;
    }

    // Иначе отображаем список тем
    if (loading && themes.length === 0) return <div className="content-area"><p>Загрузка тем...</p></div>;
    if (error) return <div className="content-area"><p style={{ color: 'red' }}>Ошибка загрузки тем: {error}</p></div>;

    return (
        <div className="content-area themes-content">
            <div className="themes-header">
                <h2>Темы форума</h2>
            </div>

            {loading && themes.length > 0 && <p>Обновление списка...</p>}
            {themes.length > 0 ? (
                <div className="themes-grid">
                    {themes.map((theme) => (
                        <div key={theme.id} className="theme-card">
                            {/* Делаем название темы кликабельным для перехода к подтемам */}
                            <div
                                className="theme-title"
                                onClick={() => handleViewSubThemes(theme)}
                            >
                                {theme.title}
                            </div>
                            <div className={`theme-status ${theme.status === 'Активна' ? '' : 'inactive'}`}>
                                {theme.status}
                            </div>
                            {theme.created_at && (
                                <div className="theme-date">
                                    Создано: {new Date(theme.created_at).toLocaleDateString()}
                                </div>
                            )}
                            {/* Кнопка для явного перехода к подтемам */}
                            <button
                                className="view-subthemes-btn"
                                onClick={(e) => {
                                    e.stopPropagation(); // Предотвращает всплытие клика на карточку
                                    handleViewSubThemes(theme);
                                }}
                            >
                                Подтемы
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Темы не найдены.</p>
            )}

            {/* Плавающая кнопка создания */}
            <button className="floating-create-btn" onClick={openCreateModal} title="Создать новую тему">
                +
            </button>

            {/* Модальное окно создания темы */}
            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={closeCreateModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Создать новую тему</h2>
                            <button className="close-modal-btn" onClick={closeCreateModal}>&times;</button>
                        </div>
                        {createMessage.text && (
                            <div className={`modal-message ${createMessage.type}`}>
                                {createMessage.text}
                            </div>
                        )}
                        <form onSubmit={handleCreateTheme} className="create-form">
                            <div className="form-group">
                                <label htmlFor="modal-new-theme-title">Название темы:</label>
                                <input
                                    type="text"
                                    id="modal-new-theme-title"
                                    value={newThemeTitle}
                                    onChange={(e) => setNewThemeTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-new-theme-status">Статус:</label>
                                <select
                                    id="modal-new-theme-status"
                                    value={newThemeStatus}
                                    onChange={(e) => setNewThemeStatus(e.target.value)}
                                >
                                    <option value="Активна">Активна</option>
                                    <option value="Архивирована">Архивирована</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="create-submit-btn"
                                disabled={isCreating}
                            >
                                {isCreating ? 'Создание...' : 'Создать тему'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemesList;