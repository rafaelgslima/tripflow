export type ShareTravelPlanModalMessageType = "success" | "error";

export interface ShareTravelPlanModalMessage {
  type: ShareTravelPlanModalMessageType;
  text: string;
}

export interface ShareTravelPlanModalProps {
  isOpen: boolean;
  friendEmail: string;
  friendEmailError: string | null;
  message: ShareTravelPlanModalMessage | null;
  isConfirmDisabled: boolean;
  isSending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onFriendEmailChange: (email: string) => void;
}
