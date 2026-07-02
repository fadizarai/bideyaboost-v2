import type { NativePageContent, ContentBlock } from './guide-pdf-renderer';

const ARTICLE_BLOCKS_PER_SLICE = 5;
export const INSTITUTIONS_PER_SLICE = 2;

export type PageSlice = {
  institutions: NativePageContent['institutions'];
  blocks: ContentBlock[];
  pageTitle?: string;
  sliceIndex: number;
  sliceCount: number;
  isInstitution: boolean;
  isSectionCover?: boolean;
  sectionTitle?: string;
  sectionSubtitle?: string;
  domainSection?: string;
  domainSectionSubtitle?: string;
};

export function getPageSliceCount(content: NativePageContent | null): number {
  if (!content) return 1;
  if (content.pageType === 'section') return 1;
  if (content.institutions.length > 0) {
    return Math.max(1, Math.ceil(content.institutions.length / INSTITUTIONS_PER_SLICE));
  }
  if (content.blocks.length === 0) return 1;
  return Math.max(1, Math.ceil(content.blocks.length / ARTICLE_BLOCKS_PER_SLICE));
}

export function slicePageContent(content: NativePageContent | null, sliceIndex: number): PageSlice | null {
  if (!content) return null;

  if (content.pageType === 'section') {
    return {
      institutions: [],
      blocks: [],
      sliceIndex: 0,
      sliceCount: 1,
      isInstitution: false,
      isSectionCover: true,
      sectionTitle: content.sectionTitle,
      sectionSubtitle: content.sectionSubtitle,
    };
  }

  if (content.institutions.length > 0) {
    const sliceCount = getPageSliceCount(content);
    const idx = Math.min(sliceIndex, sliceCount - 1);
    const start = idx * INSTITUTIONS_PER_SLICE;
    const institutions = content.institutions.slice(start, start + INSTITUTIONS_PER_SLICE);
    return {
      institutions,
      blocks: [],
      pageTitle: content.pageTitle,
      sliceIndex: idx,
      sliceCount,
      isInstitution: true,
      domainSection: content.domainSection,
      domainSectionSubtitle: content.domainSectionSubtitle,
    };
  }

  const sliceCount = getPageSliceCount(content);
  const idx = Math.min(sliceIndex, sliceCount - 1);
  const start = idx * ARTICLE_BLOCKS_PER_SLICE;
  const blocks = content.blocks.slice(start, start + ARTICLE_BLOCKS_PER_SLICE);

  return {
    institutions: [],
    blocks,
    pageTitle: idx === 0 ? content.pageTitle : undefined,
    sliceIndex: idx,
    sliceCount,
    isInstitution: false,
  };
}
