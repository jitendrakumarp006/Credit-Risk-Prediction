import urllib.request
import urllib.error
import json

CASES = [
    (
        {'age': 15, 'sex': 'male', 'job': 2, 'housing': 'own', 'creditAmount': 1000, 'duration': 12, 'purpose': 'car'},
        'Underage (<18)'
    ),
    (
        {'age': 30, 'sex': 'male', 'job': 2, 'housing': 'treehouse', 'creditAmount': 1000, 'duration': 12, 'purpose': 'car'},
        'Unsupported Housing'
    ),
    (
        {'age': 30, 'sex': 'male', 'job': 2, 'housing': 'own', 'creditAmount': -500, 'duration': 12, 'purpose': 'car'},
        'Negative Credit Amount'
    ),
    (
        {'age': 30, 'sex': 'male', 'job': 2, 'housing': 'own', 'creditAmount': 1000, 'duration': 0, 'purpose': 'car'},
        'Zero Duration'
    ),
    (
        {'age': 30, 'sex': 'male', 'job': 2, 'housing': 'own', 'creditAmount': 1000, 'duration': 12, 'purpose': 'cryptocurrency'},
        'Unsupported Purpose'
    ),
    (
        {'age': 30, 'sex': 'male', 'job': 5, 'housing': 'own', 'creditAmount': 1000, 'duration': 12, 'purpose': 'car'},
        'Invalid Job Code (>3)'
    ),
]

def run_failure_tests():
    print("Executing API Validation & Failure Scenario Tests...")
    for applicant, desc in CASES:
        payload = {'applicant': applicant, 'model': 'random_forest'}
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            'http://127.0.0.1:8000/api/predict',
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        try:
            with urllib.request.urlopen(req) as res:
                print(f"FAILED: {desc} unexpectedly returned 200 OK")
        except urllib.error.HTTPError as e:
            res_json = json.loads(e.read().decode('utf-8'))
            print(f"PASSED: {desc:<25} -> HTTP {e.code} ({res_json.get('error_type', 'Error')}): {res_json.get('detail')}")

    # Test unknown model identifier
    print("\nTesting Unknown Model ID...")
    unknown_model_payload = {
        'applicant': {'age': 35, 'sex': 'male', 'job': 2, 'housing': 'own', 'creditAmount': 1000, 'duration': 12, 'purpose': 'car'},
        'model': 'xgboost_classifier'
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/predict',
        data=json.dumps(unknown_model_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as res:
            print("FAILED: Unknown model ID unexpectedly returned 200 OK")
    except urllib.error.HTTPError as e:
        res_json = json.loads(e.read().decode('utf-8'))
        print(f"PASSED: Unknown Model ID          -> HTTP {e.code} ({res_json.get('error_type')}): {res_json.get('detail')}")

if __name__ == '__main__':
    run_failure_tests()
