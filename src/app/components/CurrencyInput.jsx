import styles from "../../app/page.module.css";
import { useState, useEffect } from "react";

const CurrencyInput = ({ value, onChange, placeholder }) => {
  const [text, setText] = useState(value !== undefined ? value : "");

  useEffect(() => {
    if (value !== undefined && !isNaN(value)) {
      setText(value.toString());
    }
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;

    // Allow only digits and one decimal point
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setText(val);

      // Convert to float only if it's a valid number
      const floatVal = parseFloat(val);
      onChange(!isNaN(floatVal) ? floatVal : 0);
    }
  };

  const handleBlur = () => {
    const float = parseFloat(text);
    if (!isNaN(float)) {
      const formatted = float.toFixed(2);
      setText(formatted);
      onChange(parseFloat(formatted));
    }
  };

  return (
    <div className={styles.horizContainer} style={{boxShadow:'none'}}>
      <input
        type="text"
        value={`${text}`}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder?.replace("$", "")}
        className={styles.userInput}
        inputMode="decimal"
        style={{ minWidth: "100px"}}
      />
    </div>
  );
};

export default CurrencyInput;