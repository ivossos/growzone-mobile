import { BlurView } from "expo-blur";
import { forwardRef } from "react";
import { Platform, TouchableWithoutFeedback } from "react-native";
import { Modal as ModalRN, StyleSheet, View } from "react-native";

const Modal = forwardRef<
  React.ElementRef<typeof ModalRN>,
  React.ComponentPropsWithoutRef<typeof ModalRN> & { closeModal: () => void }
>(({ children, visible, onRequestClose, closeModal, ...props }, ref) => (
  <ModalRN
    transparent
    animationType="fade"
    visible={visible}
    onRequestClose={onRequestClose}
    {...props}
  >
    <TouchableWithoutFeedback onPress={closeModal}>
      <View style={styles.overlay}>
        <BlurView
          intensity={50}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.modalContent}>{children}</View>
      </View>
    </TouchableWithoutFeedback>
  </ModalRN>
));

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#0D0D0D",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export { Modal };
