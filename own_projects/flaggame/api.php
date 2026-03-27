<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);

$usersFile = $dataDir . '/users.json';
$scoresFile = $dataDir . '/scores.json';

function readJson($file) {
    if (!file_exists($file)) return [];
    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function writeJson($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
}

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? ($_GET['action'] ?? '');

switch ($action) {
    case 'register':
        $username = trim($input['username'] ?? '');
        $pass = $input['password'] ?? '';
        if (strlen($username) < 2 || strlen($username) > 20) respond(['error' => 'Username must be 2-20 characters'], 400);
        if (strlen($pass) < 3) respond(['error' => 'Password must be at least 3 characters'], 400);
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) respond(['error' => 'Username: letters, numbers, underscore only'], 400);

        $users = readJson($usersFile);
        foreach ($users as $u) {
            if (strtolower($u['username']) === strtolower($username)) respond(['error' => 'Username taken'], 409);
        }

        $token = bin2hex(random_bytes(16));
        $users[] = [
            'username' => $username,
            'hash' => password_hash($pass, PASSWORD_DEFAULT),
            'token' => $token,
            'created' => date('c'),
        ];
        writeJson($usersFile, $users);
        respond(['ok' => true, 'username' => $username, 'token' => $token]);
        break;

    case 'login':
        $username = trim($input['username'] ?? '');
        $pass = $input['password'] ?? '';
        $users = readJson($usersFile);
        foreach ($users as &$u) {
            if (strtolower($u['username']) === strtolower($username) && password_verify($pass, $u['hash'])) {
                $token = bin2hex(random_bytes(16));
                $u['token'] = $token;
                writeJson($usersFile, $users);
                respond(['ok' => true, 'username' => $u['username'], 'token' => $token]);
            }
        }
        respond(['error' => 'Invalid credentials'], 401);
        break;

    case 'submit':
        $username = trim($input['username'] ?? '');
        $token = $input['token'] ?? '';
        $pass = $input['password'] ?? '';
        $score = intval($input['score'] ?? 0);
        $correct = intval($input['correct'] ?? 0);
        $wrong = intval($input['wrong'] ?? 0);
        $streak = intval($input['bestStreak'] ?? 0);

        if ($score < 0 || $score > 99999) respond(['error' => 'Invalid score'], 400);

        $users = readJson($usersFile);
        $valid = false;
        $newToken = null;
        foreach ($users as &$u) {
            if (strtolower($u['username']) === strtolower($username)) {
                // Try token first, then password as fallback
                if ($token && $u['token'] === $token) {
                    $valid = true;
                    break;
                }
                if ($pass && password_verify($pass, $u['hash'])) {
                    $valid = true;
                    $newToken = bin2hex(random_bytes(16));
                    $u['token'] = $newToken;
                    writeJson($usersFile, $users);
                    break;
                }
            }
        }
        unset($u);
        if (!$valid) respond(['error' => 'Unauthorized'], 401);

        $scores = readJson($scoresFile);
        $scores[] = [
            'username' => $username,
            'score' => $score,
            'correct' => $correct,
            'wrong' => $wrong,
            'bestStreak' => $streak,
            'date' => date('c'),
        ];
        usort($scores, fn($a, $b) => $b['score'] - $a['score']);
        $scores = array_slice($scores, 0, 500);
        writeJson($scoresFile, $scores);
        $resp = ['ok' => true];
        if ($newToken) $resp['token'] = $newToken;
        respond($resp);
        break;

    case 'leaderboard':
        $scores = readJson($scoresFile);
        $top = array_slice($scores, 0, 20);
        respond(['leaderboard' => $top]);
        break;

    default:
        respond(['error' => 'Unknown action'], 400);
}
