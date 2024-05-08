// middleware/authenticate.js
const jwt = require('jsonwebtoken');
function authenticated(tokenService) {
    return async function (req, res, next) {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({message: "Token is required"});
        }

        try {
            req.user = jwt.verify(token, tokenService.jwt_secret);
            next();
        } catch (err) {
            // Если токен не действителен, проверим, не истёк ли он
            if (err.name === 'TokenExpiredError') {
                const refreshToken = req.headers['x-refresh-token'];
                const newTokens = await tokenService.refreshAccessToken(refreshToken);
                if (newTokens) {
                    // Добавляем новые токены в ответ
                    res.set('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
                    res.set('x-access-token', newTokens.accessToken);
                    res.set('x-refresh-token', newTokens.refreshToken);

                    // Добавляем payload от нового токена в запрос
                    req.user = jwt.verify(newTokens.accessToken, tokenService.jwt_secret);
                    return next();
                } else {
                    return res.status(403).json({message: "No access"});
                }
            }
            return res.status(403).json({message: "Invalid token", error: err.message});
        }
    }
}

function authenticatedDoctor(tokenService) {
    return async function (req, res, next) {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Необходим токен" });
        }

        try {
            const payload = jwt.verify(token, tokenService.jwt_secret);
            req.user = payload;

            // Проверка роли пользователя
            if (req.user.role !== 'doctor') {
                return res.status(403).json({ message: "Access denied. This route is only for doctors." });
            }

            next();
        } catch (err) {
            // Если токен не действителен, проверим, не истёк ли он
            if (err.name === 'TokenExpiredError') {
                const refreshToken = req.headers['x-refresh-token'];
                const newTokens = await tokenService.refreshAccessToken(refreshToken);
                if (newTokens) {
                    // Добавляем новые токены в ответ
                    res.set('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
                    res.set('x-access-token', newTokens.accessToken);
                    res.set('x-refresh-token', newTokens.refreshToken);

                    // Добавляем payload от нового токена в запрос
                    req.user = jwt.verify(newTokens.accessToken, tokenService.jwt_secret);
                    if (req.user.role !== 'doctor') {
                        return res.status(403).json({ message: "Доступ запрещен. Необходимы права врача для выполнения данного действия." });
                    }
                    
                    return next();
                } else {
                    return res.status(403).json({ message: "Доступ только для авторизованных пользователей." });
                }
            }
            return res.status(403).json({ message: "Некорректный токен", error: err.message });
        }
    }
}

function authenticateOptional(tokenService) {
    return async function (req, res, next) {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            next()
        }
        try {
            req.user = jwt.verify(token, tokenService.jwt_secret);

            // Если пользователь аутентифицирован как врач, применяем строгую проверку
            if (req.user.role === 'doctor') {
                return next();
            } else {
                // Продолжаем обработку для авторизованных пациентов
                return next();
            }
        } catch (err) {
            if (err.name !== 'TokenExpiredError') {
                return res.status(403).json({ message: "Invalid token", error: err.message });
            }
            
            // Попытка обновить токен
            const refreshToken = req.headers['x-refresh-token'];
            const newTokens = await tokenService.refreshAccessToken(refreshToken);
            if (!newTokens) {
                return res.status(403).json({ message: "No valid refresh token available" });
            }
            // Обновляем токены в заголовках ответа
            res.set('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
            res.set('x-access-token', newTokens.accessToken);
            res.set('x-refresh-token', newTokens.refreshToken);

            // Обновляем данные пользователя
            req.user = jwt.verify(newTokens.accessToken, tokenService.jwt_secret);

            if (req.user.role === 'doctor') {
                return next();
            } else {
                // Продолжаем обработку для авторизованных пациентов
                return next();
            }
        }
    }
}


module.exports = { authenticated, authenticatedDoctor, authenticateOptional };
