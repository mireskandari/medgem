# Medical Research Assistant

## Overview

The Medical Research Assistant is an AI-powered tool that helps researchers analyze medical data and generate testable hypotheses. It processes data through an interactive code execution system that maintains state between code executions.

## Features

- **Automatic Data Analysis**: Upload your data and let the assistant analyze it using Python
- **Jupyter Notebook Integration**: Each analysis session runs in a Jupyter notebook that's saved for later reference
- **Hypothesis Generation**: Based on data analysis, the assistant generates testable medical research hypotheses

## How It Works

1. **Upload Data**: Upload a CSV or Excel file containing medical research data
2. **Initial Analysis**: The assistant automatically analyzes the data structure and performs initial exploratory analysis
3. **Iterative Processing**: The assistant executes code, evaluates results, and refines the analysis
4. **Hypothesis Generation**: Once analysis is complete, the assistant formulates 3-5 testable hypotheses
5. **Session Persistence**: All work is saved in a Jupyter notebook that you can download or continue working with later

## Technical Implementation

- Each analysis session runs in its own Jupyter kernel
- Code execution is handled through Python's `jupyter_client` library
- Results are captured from the kernel and fed back to the AI for further analysis
- Sessions are persisted as `.ipynb` files in the configured notebooks directory

## Example Usage

1. Start a new conversation with the Medical Research Assistant
2. Upload your medical dataset (CSV or Excel format)
3. The assistant will analyze your data and generate hypotheses
4. Review the hypotheses and select which ones to pursue further
5. Download the Jupyter notebook for full transparency on the analysis process 