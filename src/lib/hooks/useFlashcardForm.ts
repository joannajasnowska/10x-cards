import { useState, useCallback, useEffect } from "react";
import type { FlashcardDTO } from "@/types";

export interface FlashcardFormState {
  front: string;
  back: string;
  isValid: boolean;
  frontError?: string;
  backError?: string;
  isSaving: boolean;
}

export const useFlashcardForm = (initialData?: FlashcardDTO) => {
  const [form, setForm] = useState<FlashcardFormState>({
    front: initialData?.front || "",
    back: initialData?.back || "",
    isValid: false,
    frontError: undefined,
    backError: undefined,
    isSaving: false,
  });

  // Validate form fields
  const validateForm = useCallback(() => {
    let isValid = true;
    let frontError: string | undefined;
    let backError: string | undefined;

    // Front validation
    if (form.front.trim() === "") {
      frontError = "Przód fiszki jest wymagany";
      isValid = false;
    } else if (form.front.length > 200) {
      frontError = "Przód fiszki nie może być dłuższy niż 200 znaków";
      isValid = false;
    }

    // Back validation
    if (form.back.trim() === "") {
      backError = "Tył fiszki jest wymagany";
      isValid = false;
    } else if (form.back.length > 500) {
      backError = "Tył fiszki nie może być dłuższy niż 500 znaków";
      isValid = false;
    }

    setForm((prev) => ({
      ...prev,
      isValid,
      frontError,
      backError,
    }));

    return isValid;
  }, [form.front, form.back]);

  // Update field values
  const updateField = useCallback((field: "front" | "back", value: string) => {
    const maxLength = field === "front" ? 200 : 500;
    // Truncate the value if it exceeds the max length
    const truncatedValue = value.slice(0, maxLength);

    setForm((prev) => ({
      ...prev,
      [field]: truncatedValue,
    }));
  }, []);

  // Reset form to initial state or empty
  const resetForm = useCallback(() => {
    setForm({
      front: initialData?.front || "",
      back: initialData?.back || "",
      isValid: false,
      frontError: undefined,
      backError: undefined,
      isSaving: false,
    });
  }, [initialData]);

  // Set saving state
  const setIsSaving = useCallback((isSaving: boolean) => {
    setForm((prev) => ({
      ...prev,
      isSaving,
    }));
  }, []);

  // Auto-validate when fields change
  useEffect(() => {
    validateForm();
  }, [form.front, form.back, validateForm]);

  return {
    form,
    updateField,
    validateForm,
    resetForm,
    setIsSaving,
  };
};
