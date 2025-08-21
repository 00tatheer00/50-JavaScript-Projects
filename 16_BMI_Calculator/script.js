document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const metricBtn = document.getElementById('metric-btn');
    const imperialBtn = document.getElementById('imperial-btn');
    const metricInputs = document.getElementById('metric-inputs');
    const imperialInputs = document.getElementById('imperial-inputs');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultPlaceholder = document.querySelector('.result-placeholder');
    const bmiResult = document.querySelector('.bmi-result');
    const bmiNumber = document.getElementById('bmi-number');
    const bmiCategory = document.getElementById('bmi-category');
    const scaleIndicator = document.getElementById('scale-indicator');
    const healthAdviceText = document.getElementById('health-advice-text');
    
    // Event Listeners
    metricBtn.addEventListener('click', () => switchMeasurementSystem('metric'));
    imperialBtn.addEventListener('click', () => switchMeasurementSystem('imperial'));
    calculateBtn.addEventListener('click', calculateBMI);
    
    // Switch between metric and imperial units
    function switchMeasurementSystem(system) {
        if (system === 'metric') {
            metricBtn.classList.add('active');
            imperialBtn.classList.remove('active');
            metricInputs.classList.remove('hidden');
            imperialInputs.classList.add('hidden');
        } else {
            imperialBtn.classList.add('active');
            metricBtn.classList.remove('active');
            imperialInputs.classList.remove('hidden');
            metricInputs.classList.add('hidden');
        }
        
        // Clear results when switching systems
        clearResults();
    }
    
    // Clear results and show placeholder
    function clearResults() {
        resultPlaceholder.classList.remove('hidden');
        bmiResult.classList.add('hidden');
    }
    
    // Calculate BMI based on selected measurement system
    function calculateBMI() {
        let height, weight, bmi;
        
        if (metricBtn.classList.contains('active')) {
            // Metric calculation (kg and cm)
            height = parseFloat(document.getElementById('height').value) / 100; // convert cm to m
            weight = parseFloat(document.getElementById('weight').value);
            
            if (!validateInputs(height * 100, weight)) return;
            
            bmi = weight / (height * height);
        } else {
            // Imperial calculation (lbs and inches)
            const feet = parseFloat(document.getElementById('feet').value);
            const inches = parseFloat(document.getElementById('inches').value);
            weight = parseFloat(document.getElementById('pounds').value);
            
            // Convert feet and inches to total inches
            height = (feet * 12) + inches;
            
            if (!validateInputs(height, weight, true)) return;
            
            // Correct BMI formula for imperial units
            bmi = (weight / (height * height)) * 703;
        }
        
        // Round BMI to one decimal place
        bmi = Math.round(bmi * 10) / 10;
        
        // Display results
        displayResults(bmi);
    }
    
    // Validate input values
    function validateInputs(height, weight, isImperial = false) {
        // Check if inputs are valid numbers
        if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
            alert('Please enter valid height and weight values.');
            return false;
        }
        
        // Height validation
        if (isImperial) {
            if (height < 36 || height > 96) { // 3ft to 8ft in inches
                alert('Please enter a height between 3 and 8 feet.');
                return false;
            }
        } else {
            if (height < 50 || height > 250) { // 50cm to 250cm
                alert('Please enter a height between 50cm and 250cm.');
                return false;
            }
        }
        
        // Weight validation
        if (isImperial) {
            if (weight < 50 || weight > 700) { // 50lbs to 700lbs
                alert('Please enter a weight between 50lbs and 700lbs.');
                return false;
            }
        } else {
            if (weight < 10 || weight > 300) { // 10kg to 300kg
                alert('Please enter a weight between 10kg and 300kg.');
                return false;
            }
        }
        
        // Age validation
        const age = parseInt(document.getElementById('age').value);
        if (isNaN(age) || age < 2 || age > 120) {
            alert('Please enter a valid age between 2 and 120.');
            return false;
        }
        
        return true;
    }
    
    // Display BMI results
    function displayResults(bmi) {
        // Update BMI value
        bmiNumber.textContent = bmi;
        
        // Determine BMI category
        let category, advice, color;
        
        if (bmi < 18.5) {
            category = 'Underweight';
            advice = 'You may need to gain weight. Consult with a healthcare provider for advice on a balanced diet and healthy weight gain strategies.';
            color = '#63b3ed';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal weight';
            advice = 'Maintain your weight with a balanced diet and regular physical activity. Continue with your healthy habits!';
            color = '#68d391';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            advice = 'Consider making lifestyle changes such as healthier eating and increased physical activity. Even small changes can make a big difference.';
            color = '#faf089';
        } else {
            category = 'Obesity';
            advice = 'It\'s important to take action. Consult with a healthcare provider to develop a weight management plan that works for you.';
            color = '#fc8181';
        }
        
        // Update category and advice
        bmiCategory.textContent = category;
        bmiCategory.style.color = color;
        healthAdviceText.textContent = advice;
        
        // Update scale indicator position (0% to 100% scale)
        // BMI ranges from about 15 to 40+ on the scale
        const position = Math.min(Math.max(((bmi - 15) / 25) * 100, 0), 100);
        scaleIndicator.style.left = `${position}%`;
        
        // Show results and hide placeholder
        resultPlaceholder.classList.add('hidden');
        bmiResult.classList.remove('hidden');
    }
});