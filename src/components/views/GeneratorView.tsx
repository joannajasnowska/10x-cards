import React from "react";
import GenerationForm from "../generator/GenerationForm";
import SkeletonLoader from "../generator/SkeletonLoader";
import ErrorDisplay from "../ui/ErrorDisplay";
import FlashcardsProposalList from "../generator/FlashcardsProposalList";
import EditFlashcardModal from "../generator/EditFlashcardModal";
import useGeneratorState from "../../hooks/useGeneratorState";

export default function GeneratorView() {
  const {
    sourceText,
    selectedModel,
    proposals,
    isGenerating,
    isSaving,
    generationError,
    saveError,
    editingProposalId,
    editingProposal,
    setSourceText,
    setSelectedModel,
    handleGenerate,
    handleAccept,
    handleReject,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleSaveApproved,
    handleSaveAll,
  } = useGeneratorState();

  return (
    <div className="space-y-6">
      <GenerationForm
        sourceText={sourceText}
        selectedModel={selectedModel}
        isGenerating={isGenerating}
        onInputChange={setSourceText}
        onModelChange={setSelectedModel}
        onSubmit={handleGenerate}
      />

      {isGenerating && <SkeletonLoader />}

      {generationError && <ErrorDisplay error={generationError} />}

      {saveError && <ErrorDisplay error={saveError} />}

      {proposals.length > 0 && !isGenerating && (
        <FlashcardsProposalList
          proposals={proposals}
          isSaving={isSaving}
          onAccept={handleAccept}
          onReject={handleReject}
          onEdit={handleEditStart}
          onSaveApproved={handleSaveApproved}
          onSaveAll={handleSaveAll}
        />
      )}

      {editingProposal && (
        <EditFlashcardModal
          isOpen={!!editingProposalId}
          proposal={editingProposal}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
}
