import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Пожалуйста, введите имя пользователя');
            return false;
        }
        if (!formData.password) {
            setError('Пожалуйста, введите пароль');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Успешный вход:', data);
                if (onLoginSuccess) {
                    onLoginSuccess(data.user, data.token);
                }
                alert(data.message || 'Вход выполнен успешно!');
            } else {
                setError(data.error || data.message || 'Ошибка входа в систему');
            }
        } catch (err) {
            console.error('Ошибка сети:', err);
            setError('Не удалось подключиться к серверу. Проверьте соединение.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    {/* Заголовок */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <User className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Добро пожаловать</h1>
                        <p className="text-gray-500">Войдите в свой аккаунт</p>
                    </div>

                    {/* Форма */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-red-600 text-center font-medium">{error}</p>
                            </div>
                        )}

                        {/* Поле имени пользователя */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Имя пользователя</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange('username')}
                                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Введите имя пользователя"
                                />
                            </div>
                        </div>

                        {/* Поле пароля */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Пароль</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange('password')}
                                    className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Введите пароль"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Кнопка входа */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Вход...</span>
                                </div>
                            ) : (
                                'Войти'
                            )}
                        </button>
                    </form>

                    {/* Ссылка на регистрацию */}
                    <div className="text-center mt-8">
                        <p className="text-gray-600">
                            Нет аккаунта?{' '}
                            <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors"
                                onClick={() => window.location.hash = '#register'}
                            >
                                Зарегистрироваться
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;