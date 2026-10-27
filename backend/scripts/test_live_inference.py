import urllib.request
import json

MODELS = ['random_forest', 'decision_tree', 'logistic_regression', 'svm']

TEST_CASES = {
    'Case A ($5,000, 24 mo)': {
        'age': 35,
        'sex': 'male',
        'job': 2,
        'housing': 'own',
        'savingAccounts': 'moderate',
        'checkingAccount': 'moderate',
        'creditAmount': 5000.0,
        'duration': 24,
        'purpose': 'education'
    },
    'Case B ($1,500, 12 mo)': {
        'age': 45,
        'sex': 'female',
        'job': 2,
        'housing': 'own',
        'savingAccounts': 'rich',
        'checkingAccount': 'moderate',
        'creditAmount': 1500.0,
        'duration': 12,
        'purpose': 'radio/TV'
    }
}

def run_tests():
    print("Testing Live API Endpoints (POST /api/predict)...")
    for case_name, applicant in TEST_CASES.items():
        print(f"\n==========================================")
        print(f" {case_name}")
        print(f"==========================================")
        for m in MODELS:
            payload = {'applicant': applicant, 'model': m}
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                'http://127.0.0.1:8000/api/predict',
                data=data,
                headers={'Content-Type': 'application/json'}
            )
            try:
                with urllib.request.urlopen(req) as res:
                    body = json.loads(res.read().decode('utf-8'))
                    print(f"Model: {body['model_name']:<30} (ID: {m})")
                    print(f"  Class: {body['prediction']} -> {body['predicted_label']}")
                    print(f"  Mode:  {body['mode']}")
                    print(f"  Target Def: {body['target_definition']}")
                    if body.get('probabilities'):
                        p = body['probabilities']
                        print(f"  Scores: Class 0={p['class_0_score']}, Class 1={p['class_1_score']}")
                    else:
                        print(f"  Scores: [Not exposed or not calibrated]")
                    print(f"  Timestamp: {body['prediction_timestamp']}")
            except Exception as e:
                print(f"Model: {m:<30} -> ERROR: {e}")

if __name__ == '__main__':
    run_tests()
