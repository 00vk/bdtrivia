# GitHub Setup

## 1. Создать репозиторий на GitHub

- Зайти на https://github.com/new
- Repository name: `bdtrivia`
- **Не** создавать README, .gitignore, лицензию
- Нажать «Create repository»

## 2. Подключить локальный репозиторий

```bash
# заменить <username> на свой логин
git remote add origin https://github.com/<username>/bdtrivia.git
git branch -M main
git add -A
git commit -m "Initial scaffold: agent pipeline configs + mvp backlog"
git push -u origin main
```

## 3. Включить GitHub Pages

- GitHub → Settings → Pages
- Source: `Deploy from a branch`
- Branch: `main`, root (`/`)
- Сохранить

После этого сайт будет доступен по адресу:
```
https://<username>.github.io/bdtrivia/
```

## 4. Создать Issues из бэклога (опционально)

После пуша можно вручную создать Issues (по одной фиче на issue) через:
- GitHub → Issues → New issue
- Или импортировать через GitHub Projects (Beta)

Для каждой фичи из `docs/mvp/index.md` создаётся отдельный Issue с ссылкой на соответствующий `.md` файл.
