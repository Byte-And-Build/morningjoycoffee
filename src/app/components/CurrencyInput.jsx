import styles from "../../app/page.module.css";
import { useState, useEffect } from "react";

const CurrencyInput = ({ value, onChange, placeholder }) => {
  const [text, setText] = useState(value?.toFixed(2) || "");

  useEffect(() => {
    setText(value?.toFixed(2) || "");
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    const cleaned = val.replace(/[^0-9.]/g, "");
    const decimalCount = (cleaned.match(/\./g) || []).length;
    if (decimalCount > 1) return;

    setText(cleaned);
    const float = parseFloat(cleaned);
    onChange(isNaN(float) ? 0 : float);
  };

  const handleBlur = () => {
    const float = parseFloat(text);
    if (!isNaN(float)) {
      setText(float.toFixed(2));
    }
  };

  return (
    <div className={styles.currencyInputWrapper}>
      <label className={styles.dollarSign}>$</label>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder?.replace("$", "")}
        className={styles.currencyInput}
        inputMode="decimal" // optional for mobile keyboards
      />
    </div>
  );
};

export default CurrencyInput;
