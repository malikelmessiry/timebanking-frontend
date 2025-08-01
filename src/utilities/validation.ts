export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRegistrationData = (data: {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
}): ValidationResult => {
  const errors: string[] = [];

// Email validation
if (!data.email) {
  errors.push('Email is required');
} else if (!data.email.includes('@') || !data.email.includes('.')) {
  errors.push('Please enter a valid email address');
}

// Password validation
if (!data.password) {
  errors.push('Password is required');
} else {
  if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (/^\d+$/.test(data.password)) {
    errors.push('Password cannot be entirely numeric');
  }
  if (['password', '12345678', 'qwerty', 'abc123'].includes(data.password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password.');
  }
}

// Password confirmation
if (data.password !== data.password2) {
  errors.push('Passwords do not match');
}

// Required fields
if (!data.first_name.trim()) {
  errors.push('First name is required');
}
if (!data.last_name.trim()) {
  errors.push('Last name is required');
}
if (!data.street.trim()) {
  errors.push('Street address is required');
}
if (!data.city.trim()) {
  errors.push('City is required');
}
if (!data.state.trim()) {
  errors.push('State is required');
}
if (!data.zip_code.trim()) {
  errors.push('ZIP code is required');
} else if (!/^\d{5}(-\d{4})?$/.test(data.zip_code)) {
  errors.push('Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
}

return {
  isValid: errors.length === 0,
  errors
};
};

export const validateLoginData = (data: { email: string; password: string }): ValidationResult => {
  const errors: string[] = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!data.email.includes('@')) {
    errors.push('Please enter a valid email address');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Convert comma-separated interests to array
export const parseInterests = (interestsString: string): string[] => {
    if (!interestsString.trim()) return [];
    
    return interestsString
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0)
        .slice(0, 10); // Limit to 10 interests
};