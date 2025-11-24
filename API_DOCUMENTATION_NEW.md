# EazyBet API Documentation

Complete API reference for the EazyBet betting platform.

## Base URL
All API endpoints are relative to: `/api`

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "referralCode": "EZB-XXXXXX" // optional
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "referralCode": "EZB-ABCDEF",
    "avatar": "",
    "bio": "",
    "isAdmin": false,
    "createdAt": "2025-11-24T00:00:00Z"
  },
  "wallet": {
    "user_id": "uuid",
    "tokens": 1000,
    "diamonds": 0,
    "total_earned_tokens": 0,
    "total_earned_diamonds": 0
  },
  "session": { ... }
}
```

**Referral Bonuses:**
- New user with referral code: +500 tokens
- Referrer when referred user places first bet: +1000 tokens

---

### Login User
**POST** `/auth/login`

Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "wallet": { ... },
  "session": { ... },
  "access_token": "eyJhbGciOiJIUzI1..."
}
```

---

### Get Current User
**GET** `/auth/me`

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": { ... },
  "wallet": { ... }
}
```

---

## Wallet Endpoints

### Get Wallet
**GET** `/wallet`

Get user's wallet information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "wallet": {
    "user_id": "uuid",
    "tokens": 5000,
    "diamonds": 50,
    "total_earned_tokens": 10000,
    "total_earned_diamonds": 100,
    "updated_at": "2025-11-24T00:00:00Z"
  }
}
```

---

### Convert Tokens to Diamonds
**POST** `/wallet/convert`

Convert tokens to diamonds (100 tokens = 1 diamond).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tokenAmount": 500
}
```

**Response (200):**
```json
{
  "message": "Conversion successful",
  "wallet": { ... },
  "conversion": {
    "tokensSpent": 500,
    "diamondsEarned": 5
  }
}
```

---

## Tap-to-Earn Endpoints

### Tap for Tokens
**POST** `/tap`

Earn tokens by tapping (max 10 taps per hour).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Tap successful",
  "earned": 5,
  "wallet": { ... }
}
```

**Response (429) - Rate Limited:**
```json
{
  "error": "Tap limit reached. Maximum 10 taps per hour."
}
```

---

### Get Tap Status
**GET** `/tap`

Get tap history and remaining taps.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "taps": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "earned": 5,
      "created_at": "2025-11-24T00:00:00Z"
    }
  ],
  "canTap": true,
  "remaining": 7
}
```

---

## Matches Endpoints

### Get Upcoming Matches
**GET** `/matches/upcoming`

Get all upcoming and live matches available for betting.

**Response (200):**
```json
{
  "matches": [
    {
      "id": "uuid",
      "team_home": "PSG",
      "team_away": "Bayern Munich",
      "team_home_image": "https://...",
      "team_away_image": "https://...",
      "competition": "UEFA Champions League",
      "odd_home": 2.50,
      "odd_draw": 3.20,
      "odd_away": 2.80,
      "start_time": "2025-11-25T20:00:00Z",
      "status": "UPCOMING",
      "score_home": null,
      "score_away": null
    }
  ]
}
```

---

### Get Match Results
**GET** `/matches/results`

Get finished matches with results.

**Response (200):**
```json
{
  "matches": [
    {
      "id": "uuid",
      "team_home": "Real Madrid",
      "team_away": "Barcelona",
      "odd_home": 2.10,
      "odd_draw": 3.40,
      "odd_away": 3.50,
      "start_time": "2025-11-24T18:00:00Z",
      "status": "FINISHED",
      "score_home": 2,
      "score_away": 1
    }
  ]
}
```

---

### Create Match (Admin)
**POST** `/matches/admin/create`

Create a new match.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "teamHome": "Liverpool",
  "teamAway": "Manchester City",
  "teamHomeImage": "https://...",
  "teamAwayImage": "https://...",
  "competition": "Premier League",
  "oddHome": 2.40,
  "oddDraw": 3.30,
  "oddAway": 2.90,
  "startTime": "2025-11-26T16:00:00Z"
}
```

**Response (201):**
```json
{
  "message": "Match created successfully",
  "match": { ... }
}
```

---

### Update Match Score (Admin)
**POST** `/matches/admin/update-score`

Update match score and trigger bet resolution.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "matchId": "uuid",
  "scoreHome": 3,
  "scoreAway": 1,
  "status": "FINISHED"
}
```

**Response (200):**
```json
{
  "message": "Match score updated successfully",
  "match": { ... }
}
```

**Note:** This automatically triggers bet result calculation and wallet updates.

---

## Bets Endpoints

### Place Bet
**POST** `/bets/place`

Place a bet on a match.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "matchId": "uuid",
  "choice": "HOME",  // HOME | DRAW | AWAY
  "amount": 100
}
```

**Response (201):**
```json
{
  "message": "Bet placed successfully",
  "bet": {
    "id": "uuid",
    "user_id": "uuid",
    "match_id": "uuid",
    "choice": "HOME",
    "amount": 100,
    "result": "PENDING",
    "gain": 0,
    "created_at": "2025-11-24T00:00:00Z"
  },
  "wallet": { ... }
}
```

---

### Get My Bets
**GET** `/bets/my`

Get all user's bets with match information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "bets": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "match_id": "uuid",
      "choice": "HOME",
      "amount": 100,
      "result": "WIN",
      "gain": 250,
      "created_at": "2025-11-24T00:00:00Z",
      "matches": {
        "id": "uuid",
        "team_home": "PSG",
        "team_away": "Bayern",
        "status": "FINISHED",
        "score_home": 3,
        "score_away": 1
      }
    }
  ]
}
```

---

### Get Bet History
**GET** `/bets/history`

Get completed bets with statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "bets": [ ... ],
  "stats": {
    "total": 50,
    "wins": 32,
    "losses": 18,
    "totalWagered": 5000,
    "totalWon": 8500
  }
}
```

---

## Leaderboard Endpoints

### Get Leaderboard
**GET** `/leaderboard`

Get top 100 players by diamonds.

**Response (200):**
```json
{
  "leaderboard": [
    {
      "user_id": "uuid",
      "username": "player1",
      "diamonds": 1500,
      "rank": 1,
      "updated_at": "2025-11-24T00:00:00Z"
    }
  ]
}
```

---

### Refresh Leaderboard (Admin)
**POST** `/leaderboard`

Manually refresh leaderboard rankings.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Leaderboard refreshed successfully",
  "leaderboard": [ ... ]
}
```

---

## Referral Endpoints

### Get Referral Stats
**GET** `/referrals/stats`

Get user's referral statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "referralCode": "EZB-ABCDEF",
  "stats": {
    "totalReferrals": 5,
    "bonusesGiven": 3,
    "pendingBonuses": 2
  },
  "referrals": [
    {
      "id": "uuid",
      "sponsor_id": "uuid",
      "referred_user_id": "uuid",
      "bonus_given": true,
      "created_at": "2025-11-24T00:00:00Z",
      "referred_user": {
        "id": "uuid",
        "username": "newplayer",
        "email": "new@example.com",
        "created_at": "2025-11-24T00:00:00Z"
      }
    }
  ]
}
```

---

## Error Responses

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "error": "Error message describing what went wrong"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limits

- **Tap-to-Earn:** 10 taps per hour
- **Referrals:** 3 new referrals per day (anti-abuse)

---

## Supabase Edge Functions

### auto-resolve-bets
Automatically resolves pending bets when matches finish.

**URL:** `https://<project-ref>.supabase.co/functions/v1/auto-resolve-bets`

**Method:** POST

**Schedule:** Run via cron job every 15 minutes

---

### refresh-leaderboard-cron
Refreshes leaderboard rankings.

**URL:** `https://<project-ref>.supabase.co/functions/v1/refresh-leaderboard-cron`

**Method:** POST

**Schedule:** Run via cron job daily at midnight

---

## Database Triggers (Automatic)

### Referral Signup Bonus
- **Trigger:** User registration with referral code
- **Action:** +500 tokens to new user, create referral relationship

### First Bet Referral Bonus
- **Trigger:** Referred user places first bet
- **Action:** +1000 tokens to sponsor

### Bet Result Calculation
- **Trigger:** Match score update to FINISHED status
- **Action:** Calculate all bet results, update wallets

### Wallet Creation
- **Trigger:** New user registration
- **Action:** Create wallet with 1000 initial tokens

---

## Security Notes

1. All passwords are hashed using Supabase Auth
2. Row Level Security (RLS) enabled on all tables
3. Admin endpoints require `is_admin = true`
4. Rate limiting on tap-to-earn and referrals
5. Self-referral prevention
6. All sensitive operations logged in `system_logs`
