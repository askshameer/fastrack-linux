#!/bin/bash
echo "Current directory: $(pwd)"
echo "Git status:"
git status
echo "Adding files..."
git add .
echo "Committing..."
git commit -m "Linux branch updates with QuestionBankSection fix"
echo "Pushing to remote..."
git push -u origin linux-development
