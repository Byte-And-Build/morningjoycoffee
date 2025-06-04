import { useState } from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";

const CurrencyInput = ({ value, onChange, placeholder }) => {
    const [text, setText] = useState(value?.toFixed(2) || "");
  
    const handleChange = (val) => {
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
      <View style={styles.currencyInputWrapper}>
        <Text style={styles.dollarSign}>$</Text>
        <TextInput
          keyboardType="decimal-pad"
          value={text}
          onChangeText={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder?.replace("$", "")}
          style={styles.currencyInput}
        />
      </View>
    );
  };   

export default CurrencyInput;

const styles = StyleSheet.create({
userInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },
  currencyInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "white",
    paddingHorizontal: 8,
  },
  
  dollarSign: {
    fontSize: 16,
    marginRight: 4,
    color: "#555",
  },
  
  currencyInput: {
    width: "100%",
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    color: "black",
  },  
})