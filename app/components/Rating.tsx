import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useAuth } from "../context/AuthContext";

const Rating = ({ item, thumbsUp, thumbsDown, handleRatingUpdate }) => {
  const { user } = useAuth();
    // console.log(item._id)
  return (
  <View style={styles.ratingWrapper}>
    {user ? (
      <>
        <TouchableOpacity style={styles.ratingContainer} onPress={() => handleRatingUpdate("thumbsUp")}>
          <Text style={styles.ratingText}>{thumbsUp}</Text>
          <FontAwesome5 name="thumbs-up" size={24} color="teal" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ratingContainer} onPress={() => handleRatingUpdate("thumbsDown")}>
          <Text style={styles.ratingText}>{thumbsDown}</Text>
          <FontAwesome5 name="thumbs-down" size={24} color="teal" />
        </TouchableOpacity>
      </>
    ) : (
      <>
        <TouchableOpacity style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{thumbsUp}</Text>
          <FontAwesome5 name="thumbs-up" size={24} color="teal" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{thumbsDown}</Text>
          <FontAwesome5 name="thumbs-down" size={24} color="teal" />
        </TouchableOpacity>
      </>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  ratingWrapper: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 20,
  },
  ratingContainer: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "rgb(255, 219, 246)",
    borderRadius: 10,
    flexDirection: "row-reverse",
    gap: 10
  },
  ratingText: {
    color: "rgb(0, 0, 0)",
    fontSize: 16,
    fontWeight: "bold",
  },
  hintText: {
    color: "rgb(0, 0, 0)",
    fontSize: 10,
    fontWeight: "light",
    fontStyle: "italic"
  }
});

export default Rating;
