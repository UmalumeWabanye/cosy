import React, { useState } from 'react';

const AccommodationRequestForm = () => {
    const [step, setStep] = useState(1);
    const [personalInfo, setPersonalInfo] = useState({ name: '', email: '' });
    const [documents, setDocuments] = useState(null);
    const [accommodationDetails, setAccommodationDetails] = useState({ preferences: '' });

    const handleNext = () => setStep(step + 1);
    const handlePrevious = () => setStep(step - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle final submission
        console.log({ personalInfo, documents, accommodationDetails });
    };

    return (
        <form onSubmit={handleSubmit}>
            {step === 1 && (
                <div>
                    <h2>Personal Information</h2>
                    <input
                        type="text"
                        placeholder="Name"
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        required
                    />
                    <button type="button" onClick={handleNext}>Next</button>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h2>Document Upload</h2>
                    <input
                        type="file"
                        onChange={(e) => setDocuments(e.target.files[0])}
                    />
                    <button type="button" onClick={handlePrevious}>Previous</button>
                    <button type="button" onClick={handleNext}>Next</button>
                </div>
            )}
            {step === 3 && (
                <div>
                    <h2>Accommodation Details</h2>
                    <textarea
                        placeholder="Preferences"
                        value={accommodationDetails.preferences}
                        onChange={(e) => setAccommodationDetails({ ...accommodationDetails, preferences: e.target.value })}
                    />
                    <button type="button" onClick={handlePrevious}>Previous</button>
                    <button type="submit">Submit</button>
                </div>
            )}
        </form>
    );
};

export default AccommodationRequestForm;