(function () {
    const DEFAULT_CREDENTIALS = {
        username: 'adminhag@gmail.com',
        password: 'CAÑOLA2027*'
    };

    const userConfig = window.HAGO_ADMIN_CREDENTIALS || {};
    const credentials = Object.assign({}, DEFAULT_CREDENTIALS, userConfig);

    window.HAGO_ADMIN_CREDENTIALS = credentials;
    window.HAGO_ADMIN_SESSION = {
        key: 'adminLoggedIn',
        userKey: 'adminUser',
        loginTimeKey: 'loginTime',
        sessionDurationMs: 2 * 60 * 60 * 1000,
        isActive() {
            if (sessionStorage.getItem(this.key) !== 'true') return false;
            const loginTime = Number(sessionStorage.getItem(this.loginTimeKey) || 0);
            if (!loginTime) return true;
            return Date.now() - loginTime < this.sessionDurationMs;
        },
        start(username) {
            sessionStorage.setItem(this.key, 'true');
            sessionStorage.setItem(this.loginTimeKey, String(Date.now()));
            sessionStorage.setItem(this.userKey, String(username || 'admin'));
        },
        end() {
            sessionStorage.removeItem(this.key);
            sessionStorage.removeItem(this.userKey);
            sessionStorage.removeItem(this.loginTimeKey);
        }
    };
})();
