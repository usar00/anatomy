import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Unit,
  Section,
  Concept,
  UserSectionProgress,
  UnitWithSections,
  SectionWithProgress,
  LessonQuestion,
  QuestionWithChoices,
} from "@/types/quiz";

export async function fetchUnitsWithProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<UnitWithSections[]> {
  // Fetch all units
  const { data: units } = await supabase
    .from("units")
    .select("*")
    .order("sort_order");

  if (!units || units.length === 0) return [];

  // Fetch all sections
  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .order("sort_order");

  // Fetch user progress
  const { data: progress } = await supabase
    .from("user_section_progress")
    .select("*")
    .eq("user_id", userId);

  // Fetch concepts
  const { data: concepts } = await supabase
    .from("concepts")
    .select("*")
    .order("sort_order");

  const progressMap: Record<string, UserSectionProgress> = {};
  if (progress) {
    for (const p of progress as UserSectionProgress[]) {
      progressMap[p.section_id] = p;
    }
  }

  const conceptsBySectionMap: Record<string, Concept[]> = {};
  if (concepts) {
    for (const c of concepts as Concept[]) {
      if (!conceptsBySectionMap[c.section_id]) conceptsBySectionMap[c.section_id] = [];
      conceptsBySectionMap[c.section_id].push(c);
    }
  }

  return (units as Unit[]).map((unit) => {
    const unitSections = ((sections || []) as Section[])
      .filter((s) => s.unit_id === unit.id)
      .map((section, index): SectionWithProgress => {
        const sectionProgress = progressMap[section.id] || null;
        // First section is always available, rest depends on previous completion
        let defaultStatus: "locked" | "available" = "locked";
        if (index === 0) defaultStatus = "available";

        return {
          ...section,
          progress: sectionProgress || {
            id: "",
            user_id: userId,
            section_id: section.id,
            status: defaultStatus,
            stars: 0,
            best_score: 0,
            attempts: 0,
            completed_at: null,
          },
          concepts: conceptsBySectionMap[section.id] || [],
        };
      });

    // Unlock sections based on previous completion
    for (let i = 1; i < unitSections.length; i++) {
      const prev = unitSections[i - 1];
      if (prev.progress?.status === "completed") {
        if (unitSections[i].progress?.status === "locked") {
          unitSections[i] = {
            ...unitSections[i],
            progress: {
              ...unitSections[i].progress!,
              status: "available",
            },
          };
        }
      }
    }

    return { ...unit, sections: unitSections };
  });
}

export async function fetchLessonQuestions(
  supabase: SupabaseClient,
  sectionId: string
): Promise<LessonQuestion[]> {
  const { data: questions } = await supabase
    .from("questions")
    .select(`
      *,
      choices (*),
      images:question_images (*)
    `)
    .eq("section_id", sectionId)
    .eq("is_active", true)
    .order("created_at");

  if (!questions || questions.length === 0) return [];

  // Fetch concepts for these questions
  const questionIds = (questions as { id: string }[]).map((q) => q.id);
  const { data: qcLinks } = await supabase
    .from("question_concepts")
    .select("question_id, concept_id")
    .in("question_id", questionIds);

  const { data: conceptsData } = await supabase
    .from("concepts")
    .select("*")
    .eq("section_id", sectionId);

  const conceptMap: Record<string, Concept> = {};
  if (conceptsData) {
    for (const c of conceptsData as Concept[]) {
      conceptMap[c.id] = c;
    }
  }

  const questionConceptMap: Record<string, Concept[]> = {};
  if (qcLinks) {
    for (const link of qcLinks as { question_id: string; concept_id: string }[]) {
      if (!questionConceptMap[link.question_id]) questionConceptMap[link.question_id] = [];
      const concept = conceptMap[link.concept_id];
      if (concept) questionConceptMap[link.question_id].push(concept);
    }
  }

  return (questions as unknown as QuestionWithChoices[]).map((q) => ({
    ...q,
    interaction_type: (q as unknown as { interaction_type: string }).interaction_type as LessonQuestion["interaction_type"],
    concepts: questionConceptMap[q.id] || [],
  }));
}

export async function fetchSectionInfo(
  supabase: SupabaseClient,
  sectionId: string
): Promise<{ section: Section; unit: Unit } | null> {
  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("id", sectionId)
    .single();

  if (!section) return null;

  const typedSection = section as Section;
  const { data: unit } = await supabase
    .from("units")
    .select("*")
    .eq("id", typedSection.unit_id)
    .single();

  if (!unit) return null;

  return { section: typedSection, unit: unit as Unit };
}
