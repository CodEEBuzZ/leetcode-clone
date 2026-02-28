import React from 'react';
import hackerImage from '../assets/Hacker.jpg'; 

const AuthModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
            
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-600 transform transition-all scale-100 animate-bounce-short">
                
                <div className="text-center flex flex-col items-center">
                    
                    <div className="w-24 h-24 mb-4 rounded-full border-4 border-blue-500 shadow-xl flex items-center justify-center animate-bounce-short overflow-hidden bg-gray-900">
                        <img 
                            src={hackerImage}
                            alt="Hacker Icon"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-white mb-3">
                        Hold on, Coder!
                    </h2>
                    
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        You need an account to write code, run test cases, and save your progress. Join the platform to unleash your full potential!
                    </p>
                    
                    <div className="flex flex-col space-y-3 w-full">
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200"
                        >
                            Log In / Register
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white font-semibold py-2 px-4 transition-colors duration-200"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
            
            <style jsx="true">{`
                @keyframes bounce-short {
                    0% { transform: scale(0.9); opacity: 0; }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-short {
                    animation: bounce-short 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AuthModal;