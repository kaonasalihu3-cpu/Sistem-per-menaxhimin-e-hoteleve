<?php

return [
    'jwt_secret' => env('JWT_SECRET', ''),
    'access_token_ttl' => env('ACCESS_TOKEN_TTL', 15),
    'refresh_token_days' => env('REFRESH_TOKEN_DAYS', 14),
];

