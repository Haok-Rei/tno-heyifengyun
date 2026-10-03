"""Stdlib-only transport. Credentials never enter request JSON, artifacts or logs."""
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Never forward the bearer token to a redirected host.
        return None

def main():
    config = {}
    p = Path(sys.argv[1])
    if p.exists():
        for line in p.read_text(encoding='utf-8-sig').splitlines():
            if '=' in line and not line.lstrip().startswith('#'):
                k, v = line.split('=', 1)
                config[k.strip()] = v.strip()
    key = os.environ.get('DEEPSEEK_API_KEY') or config.get('DEEPSEEK_API_KEY')
    if not key:
        print(json.dumps({'error': 'missing_key'})); return
    # User authorization covers DeepSeek, not arbitrary third-party endpoints.
    endpoint = os.environ.get('DEEPSEEK_BASE_URL', config.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')).rstrip('/')
    if endpoint not in ('https://api.deepseek.com', 'https://api.deepseek.com/v1'):
        print(json.dumps({'error': 'unapproved_endpoint'})); return
    payload = json.loads(sys.stdin.buffer.read().decode('utf-8'))
    req = urllib.request.Request(endpoint+'/chat/completions', data=json.dumps(payload, ensure_ascii=False).encode(), headers={'Authorization': 'Bearer '+key, 'Content-Type': 'application/json'})
    try:
        with urllib.request.build_opener(NoRedirect()).open(req, timeout=150) as response:
            data = json.load(response)
        print(json.dumps(data, ensure_ascii=True))
    except urllib.error.HTTPError as exc:
        # No response body or headers: SDK diagnostics may contain credentials.
        print(json.dumps({'error': 'http_error', 'status': exc.code}))
    except Exception as exc:
        print(json.dumps({'error': 'connection_error', 'category': type(exc).__name__}))

if __name__ == '__main__':
    main()
