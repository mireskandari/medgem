# 🏥 MedGem: Your AI-Powered Medical Data Analysis Companion

<div align="center">
  <img src="frontend/public/logo.png" alt="MedGem Logo" width="200"/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)](https://nextjs.org/)
  [![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
  [![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Enabled-green)](https://ai.google.dev/gemini-api)
  
  *Revolutionizing Medical Data Analysis with AI*
</div>

## 🌟 What is MedGem?

MedGem is an innovative medical data analysis platform that combines the power of Google's Gemini AI with intuitive data visualization and analysis tools. Built during a hackathon, this project aims to make medical data analysis more accessible, efficient, and insightful for healthcare professionals and researchers.

## 🚀 Features

### 🤖 AI-Powered Analysis
- Seamless integration with Google's Gemini AI model
- Natural language processing for medical data queries
- Intelligent data interpretation and insights generation
- Context-aware responses based on medical domain knowledge
- Automated hypothesis generation with supporting evidence
- Three-phase analysis process:
  1. Data Understanding and Cleaning
  2. Exploratory Data Analysis and Correlation Analysis
  3. Hypothesis Formulation

### 📊 Data Management
- Support for various medical data formats (CSV, Excel, etc.)
- Secure file upload and storage
- Real-time data processing and analysis
- Interactive data visualization
- Comprehensive data cleaning and preprocessing:
  - Missing value handling with multiple strategies (mean, median, mode imputation)
  - Data format standardization (dates, times, units)
  - Outlier detection and handling
  - Data type validation and conversion
- Advanced metadata extraction:
  - Basic file information (rows, columns, data types)
  - Descriptive statistics (min, max, mean, median, std dev)
  - Missing data analysis
  - Distribution characteristics
  - Relationship exploration

### 👥 User Experience
- Modern, responsive web interface built with Next.js
- Intuitive chat interface for data queries
- Real-time feedback and suggestions
- Session management and project organization
- Interactive hypothesis visualization
- Real-time code execution and results display
- Support for iterative analysis and refinement

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.3
- **UI**: React 19, TailwindCSS
- **Data Visualization**: Custom components with MathJax support
- **Authentication**: Supabase Auth
- **File Processing**: PapaParse, XLSX
- **Markdown Support**: React Markdown for hypothesis display

### Backend
- **Framework**: FastAPI
- **AI Integration**: Google Gemini API
- **Database**: Supabase
- **Deployment**: Docker, Google Cloud Run
- **Data Processing**: Pandas, NumPy
- **Code Execution**: Jupyter Notebook environment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Docker (optional)
- Google Cloud Platform account (for deployment)
- Google Gemini API key

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medgem.git
   cd medgem
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r docker/requirements.txt
   export PYTHONPATH=.
   python app/main.py
   ```

4. Set up your environment variables:
   ```bash
   # Frontend (.env)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

   # Backend
   export GOOGLE_API_KEY=your_gemini_api_key
   ```

## 🏗️ Project Structure

```
medgem/
├── frontend/           # Next.js frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # FastAPI backend service
│   ├── app/          # Application code
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Core business logic
│   │   ├── models/   # Data models
│   │   └── database/ # Database interactions
│   ├── docker/       # Docker configuration
│   └── docs/         # Documentation
└── chatbot_wrapper.py # Gemini AI integration
```

## 🔍 Analysis Workflow

1. **Data Upload and Initial Processing**
   - Upload medical data files (CSV/Excel)
   - Automatic metadata extraction
   - Data quality assessment

2. **Data Cleaning and Preprocessing**
   - Missing value handling
   - Format standardization
   - Outlier detection
   - Data type validation

3. **Exploratory Data Analysis**
   - Statistical analysis
   - Correlation studies
   - Distribution analysis
   - Relationship exploration

4. **Hypothesis Generation**
   - AI-powered hypothesis formulation
   - Supporting evidence collection
   - Analytical method suggestions
   - Expected outcomes prediction

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI team for their powerful API
- The Next.js and React communities for their excellent frameworks
- All contributors and supporters of this project

## 🎉 Hackathon Achievement

This project was developed during a hackathon, demonstrating the power of rapid prototyping and modern AI integration in healthcare. It showcases how quickly we can build powerful tools that could potentially transform medical data analysis.

---

<div align="center">
  Made with ❤️ by Henri, Kurtis, Danny and Ilia.
</div> 