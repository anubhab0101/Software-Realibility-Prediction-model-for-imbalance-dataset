# Software Reliability Prediction Model for Imbalance Dataset

## Overview
This project provides a comprehensive platform for predicting software reliability using machine learning models, with a focus on handling imbalanced datasets. It features a modern web client, a Node.js/Express backend, and Python-based machine learning integration. The system supports data upload, model training, federated learning, quantum and reinforcement learning experiments, and blockchain-based monitoring.

## Features
- Upload and manage software defect datasets
- Train and evaluate ML models for reliability prediction
- Handle imbalanced datasets with advanced techniques
- Federated learning and quantum/rl experimentation modules
- Blockchain-based monitoring and audit trails
- Interactive dashboards and visualizations

## Folder Structure
```
.
├── client/                # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/    # UI and visualization components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # API and utility functions
│   │   └── pages/         # Application pages (dashboard, upload, etc.)
│   └── index.html
├── server/                # Node.js/Express backend
│   ├── services/          # Service modules (ML, blockchain, etc.)
│   ├── index.ts           # Server entry point
│   └── routes.ts          # API routes
├── data/                  # Example datasets (CSV)
├── shared/                # Shared TypeScript types/schemas
├── ml_backend.py          # Python ML backend for model training
├── requirements-ml.txt    # Python dependencies
├── package.json           # Node.js dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS config
├── vite.config.ts         # Vite config
└── README.md              # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Python 3.8+
- (Optional) Git

### 1. Clone the Repository
```sh
git clone https://github.com/anubhab0101/Software-Realibility-Prediction-model-for-imbalance-dataset.git
cd Software-Realibility-Prediction-model-for-imbalance-dataset
```

### 2. Install Node.js Dependencies
```sh
npm install
```

### 3. Install Python Dependencies
```sh
pip install -r requirements-ml.txt
```

### 4. Start the Development Servers
- **Backend:**
  ```sh
  npm run dev
  ```
- **Frontend:**
  ```sh
  cd client
  npm install
  npm run dev
  ```

### 5. Access the App
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000) (default)

## Usage
- Upload datasets via the dashboard
- Train and evaluate models
- Explore federated, quantum, and RL modules
- Monitor results and blockchain logs

## Datasets
Sample datasets are provided in the `data/` folder. You can add your own CSV files for experiments.

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

## License
[MIT](LICENSE)

## Acknowledgements
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [scikit-learn](https://scikit-learn.org/)

---
For questions or support, please open an issue on GitHub.
