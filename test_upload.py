import requests
import os

def test_dataset_upload():
    print("Testing dataset upload...")
    
    # Path to the NASA dataset
    dataset_path = os.path.join(os.path.dirname(__file__), 'data', 'nasa_defect_dataset.csv')
    
    if not os.path.exists(dataset_path):
        print(f"Dataset file not found: {dataset_path}")
        return
    
    print(f"Using dataset: {dataset_path}")
    
    # Prepare the file upload
    with open(dataset_path, 'rb') as f:
        files = {'file': ('nasa_defect_dataset.csv', f, 'text/csv')}
        data = {
            'name': 'NASA Defect Dataset Test',
            'description': 'Test upload of NASA software defect dataset'
        }
        
        print("Sending upload request...")
        try:
            response = requests.post(
                'http://localhost:5000/api/datasets/upload',
                files=files,
                data=data
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("Upload result:", result)
                print("✅ Dataset upload successful!")
            else:
                print(f"❌ Dataset upload failed with status {response.status_code}")
                print("Response text:", response.text)
                
        except Exception as e:
            print(f"Error during upload: {e}")

if __name__ == "__main__":
    test_dataset_upload()