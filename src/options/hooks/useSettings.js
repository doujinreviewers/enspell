import { useState, useEffect } from 'react';
import { updateSettings, getSettings } from '../storage';

const useSettings = (initialState) => {
  const [settings, setSettings] = useState(initialState);

  useEffect(() => {
    getSettings((savedSettings) => {
      setSettings((prev) => ({ ...prev, ...savedSettings }));
    });
  }, []);

  const handleRadioChange = (key) => (value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    updateSettings({ [key]: value });
  };

  const handleChange = (key) => (event) => {
    setSettings((prev) => ({ ...prev, [key]: event.target.checked }));
    updateSettings({ [key]: event.target.checked });
  };

  const handleTextChange = (key) => (event) => {
    setSettings((prev) => ({ ...prev, [key]: event.target.value }));
    updateSettings({ [key]: event.target.value });
  };

  return { settings, handleRadioChange, handleChange, handleTextChange };
};

export default useSettings;
