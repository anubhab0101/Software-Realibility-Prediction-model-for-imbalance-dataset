const fs = require('fs');
const path = require('path');

async function testDatasetUpload() {
  try {
    console.log('Testing dataset upload...');
    
    // Read the NASA dataset
    const datasetPath = path.join(__dirname, 'data', 'nasa_defect_dataset.csv');
    const fileBuffer = fs.readFileSync(datasetPath);
    
    // Create FormData
    const formData = new FormData();
    const file = new File([fileBuffer], 'nasa_defect_dataset.csv', { type: 'text/csv' });
    formData.append('file', file);
    formData.append('name', 'NASA Defect Dataset Test');
    formData.append('description', 'Test upload of NASA software defect dataset');
    
    console.log('Sending upload request...');
    
    // Send the request
    const response = await fetch('http://localhost:5000/api/datasets/upload', {
      method: 'POST',
      body: formData
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('Upload result:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Dataset upload successful!');
    } else {
      console.log('❌ Dataset upload failed:', result.error);
    }
    
  } catch (error) {
    console.error('Error during upload test:', error);
  }
}

// Mock FormData and File for Node.js
class File {
  constructor(buffer, filename, options = {}) {
    this.buffer = buffer;
    this.name = filename;
    this.type = options.type || 'application/octet-stream';
    this.size = buffer.length;
  }
  
  arrayBuffer() {
    return Promise.resolve(this.buffer);
  }
}

class FormData {
  constructor() {
    this._data = new Map();
  }
  
  append(key, value) {
    this._data.set(key, value);
  }
  
  async toFormData() {
    return this._data;
  }
}

// Mock fetch for Node.js
global.FormData = FormData;
global.File = File;

// Simple fetch implementation using node-fetch
const fetch = require('node-fetch');

testDatasetUpload();