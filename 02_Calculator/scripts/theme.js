export function setupThemeSwitcher() {
    document.querySelector('.btn-theme-light').addEventListener('click', () => {
        document.body.className = 'theme-light';
    });

    document.querySelector('.btn-theme-dark').addEventListener('click', () => {
        document.body.className = 'theme-dark';
    });

    document.querySelector('.btn-theme-pro').addEventListener('click', () => {
        document.body.className = 'theme-pro';
    });
}