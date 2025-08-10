import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, CheckCircle } from 'lucide-react';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username.trim()) {
      setError('Пожалуйста, введите имя пользователя');
      return false;
    }

    if (username.trim().length < 3) {
      setError('Имя пользователя должно содержать не менее 3 символов');
      return false;
    }

    if (!email.trim()) {
      setError('Пожалуйста, введите email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Пожалуйста, введите корректный email');
      return false;
    }

    if (!password) {
      setError('Пожалуйста, введите пароль');
      return false;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Успешная регистрация:', data);
        setSuccess(data.message || 'Пользователь успешно зарегистрирован!');

        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setPasswordStrength(0);

        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin();
        }, 2000);

      } else {
        setError(data.error || data.message || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('Ошибка сети:', err);
      setError('Не удалось подключиться к серверу. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Слабый';
    if (passwordStrength <= 2) return 'Средний';
    if (passwordStrength <= 3) return 'Хороший';
    return 'Отличный';
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            {/* Заголовок */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <User className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Создать аккаунт</h1>
              <p className="text-gray-500">Зарегистрируйтесь для начала работы</p>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-center font-medium">{error}</p>
                  </div>
              )}

              {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-600 text-center font-medium">{success}</p>
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
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Введите имя пользователя"
                  />
                </div>
              </div>

              {/* Поле email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Введите email"
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
                      className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
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

                {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Надежность пароля:</span>
                        <span className={`text-sm font-semibold ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                      {getPasswordStrengthText()}
                    </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                )}
              </div>

              {/* Поле подтверждения пароля */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Подтвердите пароль</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Подтвердите пароль"
                  />
                  <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Соглашение */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">Создавая аккаунт, вы соглашаетесь с:</p>
                    <ul className="space-y-1">
                      <li>• Условиями использования</li>
                      <li>• Политикой конфиденциальности</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Кнопка регистрации */}
              <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-200"
              >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Регистрация...</span>
                    </div>
                ) : success ? (
                    'Аккаунт создан!'
                ) : (
                    'Зарегистрироваться'
                )}
              </button>
            </form>

            {/* Ссылка на вход */}
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Уже есть аккаунт?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-purple-600 hover:text-purple-800 font-semibold underline transition-colors"
                >
                  Войти
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Register;