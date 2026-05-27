# Firebase Realtime Database — Data Model

Корневой путь: `/rooms/<roomCode>/`

## roomCode

Генерируется хостом при создании комнаты. 4-6 символов: буквы A-Z + цифры (исключая неоднозначные: 0/O, 1/I/L).

---

## Схема

```json
{
  "rooms": {
    "<roomCode>": {
      "hostNickname": "Алексей",
      "createdAt": 1716825600000,
      "state": "playing",
      "currentItem": 2,
      "timerEndsAt": 1716825620000,
      "items": [
        {
          "type": "slide",
          "title": "Раунд 1: История",
          "description": "Вопросы по древнему миру. Удачи!"
        },
        {
          "type": "question",
          "questionType": "choice",
          "question": "В каком году пал Рим?",
          "media": null,
          "options": ["395", "476", "410", "1453"],
          "correctAnswer": "476",
          "maxScore": 1000,
          "timeLimit": 20,
          "roundName": "История"
        },
        {
          "type": "question",
          "questionType": "text",
          "question": "Назовите столицу Австралии",
          "media": null,
          "correctAnswer": ["Канберра", "Canberra"],
          "maxScore": 2000,
          "timeLimit": 30,
          "roundName": "География"
        }
      ],
      "players": {
        "<playerId>": {
          "nickname": "Виктор",
          "score": 3400,
          "connected": true
        }
      },
      "answers": {
        "1": {
          "<playerId>": {
            "answer": "476",
            "answeredAt": 1716825610000,
            "correct": true,
            "points": 850
          }
        }
      }
    }
  }
}
```

---

## Поля

### Корень комнаты

| Поле | Тип | Описание |
|---|---|---|
| `hostNickname` | string | Никнейм хоста |
| `createdAt` | number | Timestamp создания (server.Time) |
| `state` | string | `lobby` / `playing` / `reveal` / `finished` |
| `currentItem` | number | Индекс текущего элемента в `items` |
| `timerEndsAt` | number \| null | Timestamp окончания таймера (null для slide) |
| `items` | array | Массив элементов игры |
| `players` | object | Карта подключившихся игроков |
| `answers` | object | Карта ответов по индексам элементов |

### Items (элементы игры)

**Тип: `slide`**

| Поле | Тип | Описание |
|---|---|---|
| `type` | string | `"slide"` |
| `title` | string | Заголовок раунда |
| `description` | string | Описание/правила раунда |

**Тип: `question`**

| Поле | Тип | Описание |
|---|---|---|
| `type` | string | `"question"` |
| `questionType` | string | `"choice"` \| `"text"` |
| `question` | string | Текст вопроса |
| `media` | object \| null | `{ type: "youtube"\|"audio"\|"image", url: string }` |
| `options` | string[] \| null | Варианты ответа (только для choice) |
| `correctAnswer` | string \| string[] | Правильный ответ / массив синонимов (text) |
| `maxScore` | number | Максимальное количество баллов (умолч. 1000) |
| `timeLimit` | number | Лимит времени в секундах (умолч. 20) |
| `roundName` | string | Название раунда (для отображения) |

### Players

| Поле | Тип | Описание |
|---|---|---|
| `nickname` | string | Никнейм игрока |
| `score` | number | Суммарный счёт |
| `connected` | boolean | Флаг подключения |

### Answers (для question-элементов)

Ключ — индекс элемента в `items`. Для slide-элементов ключ отсутствует.

| Поле | Тип | Описание |
|---|---|---|
| `answer` | string | Ответ игрока |
| `answeredAt` | number | Timestamp отправки ответа |
| `correct` | boolean | Корректность |
| `points` | number | Начисленные баллы |

---

## Формула подсчёта очков

```
elapsed = answeredAt - questionStartedAt
ratio   = elapsed / (timeLimit * 1000)
score   = maxScore * ceil( 1 - ratio * 0.85 )

Если ответ неверный: score = 0
Если ответа нет: score = 0
```

- Быстрый правильный ответ → `maxScore` баллов
- Ответ на последней секунде → ~`0.15 × maxScore` баллов
- Просрочка/неверно → 0 баллов

---

## Ограничения Firebase Spark (бесплатный тариф)

| Метрика | Лимит |
|---|---|
| Одновременных соединений | 100 |
| Хранилище | 1 GB |
| Transfer | 10 GB/мес |
| Запись/месяц | 20K |
| Чтение/месяц | 50K |
