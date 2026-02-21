import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { fetchChapter, type ChapterData } from "@/lib/bible";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Highlighter, Check, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function findBestMatch(verseText: string, highlightText: string): { start: number; length: number } | null {
  const vLower = verseText.toLowerCase();
  const hLower = highlightText.toLowerCase();
  const idx = vLower.indexOf(hLower);
  if (idx !== -1) return { start: idx, length: highlightText.length };
  const words = highlightText.split(/\s+/);
  for (let len = words.length; len >= 2; len--) {
    for (let start = 0; start + len <= words.length; start++) {
      const sub = words.slice(start, start + len).join(' ');
      const subIdx = vLower.indexOf(sub.toLowerCase());
      if (subIdx !== -1) return { start: subIdx, length: sub.length };
    }
  }
  return null;
}

function renderHighlightedText(text: string, highlightTexts: string[]) {
  type Segment = { text: string; highlighted: boolean };
  let segments: Segment[] = [{ text, highlighted: false }];

  for (const ht of highlightTexts) {
    const match = findBestMatch(text, ht);
    if (!match) continue;
    const next: Segment[] = [];
    for (const seg of segments) {
      if (seg.highlighted) {
        next.push(seg);
        continue;
      }
      const segStart = text.indexOf(seg.text);
      const segEnd = segStart + seg.text.length;
      const mStart = match.start;
      const mEnd = match.start + match.length;
      if (mEnd <= segStart || mStart >= segEnd) {
        next.push(seg);
        continue;
      }
      const relStart = Math.max(0, mStart - segStart);
      const relEnd = Math.min(seg.text.length, mEnd - segStart);
      if (relStart > 0) next.push({ text: seg.text.slice(0, relStart), highlighted: false });
      next.push({ text: seg.text.slice(relStart, relEnd), highlighted: true });
      if (relEnd < seg.text.length) next.push({ text: seg.text.slice(relEnd), highlighted: false });
    }
    segments = next;
  }

  return segments.map((seg, i) =>
    seg.highlighted ? (
      <mark key={i} className="bg-amber-100/70 dark:bg-amber-900/40 rounded-sm px-0.5">{seg.text}</mark>
    ) : (
      <span key={i}>{seg.text}</span>
    )
  );
}

interface ChapterReaderProps {
  bookId: string;
  bookName: string;
  chapter: number;
  sessionId: number;
  onMarkRead: () => void;
  isRead: boolean;
}

export function ChapterReader({
  bookId,
  bookName,
  chapter,
  sessionId,
  onMarkRead,
  isRead,
}: ChapterReaderProps) {
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [floatingBtn, setFloatingBtn] = useState<{
    x: number;
    y: number;
    text: string;
    verseStart: number;
    verseEnd: number;
  } | null>(null);
  const [highlightsOpen, setHighlightsOpen] = useState(false);

  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchChapter(bookId, chapter)
      .then((data) => {
        if (!cancelled) {
          setChapterData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter]);

  const { data: highlights } = useQuery<any[]>({
    queryKey: ['/api/sessions', String(sessionId), 'highlights'],
    enabled: !!sessionId,
  });

  const filteredHighlights = (highlights || []).filter(
    (h: any) => h.bookId === bookId && h.chapter === chapter
  );

  const highlightsByVerse = new Map<number, string[]>();
  for (const h of filteredHighlights) {
    for (let v = h.verseStart; v <= h.verseEnd; v++) {
      if (!highlightsByVerse.has(v)) highlightsByVerse.set(v, []);
      highlightsByVerse.get(v)!.push(h.highlightText);
    }
  }

  const getVerseFromNode = useCallback((node: Node | null): number | null => {
    if (!node) return null;
    let el: HTMLElement | null =
      node.nodeType === Node.TEXT_NODE
        ? (node.parentElement as HTMLElement)
        : (node as HTMLElement);
    while (el) {
      const verse = el.getAttribute?.("data-verse");
      if (verse) return parseInt(verse, 10);
      el = el.parentElement;
    }
    return null;
  }, []);

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setFloatingBtn(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setFloatingBtn(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const startVerse = getVerseFromNode(range.startContainer);
    const endVerse = getVerseFromNode(range.endContainer);

    if (startVerse === null || endVerse === null) {
      setFloatingBtn(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = textRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setFloatingBtn({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top - 40,
      text: selectedText,
      verseStart: Math.min(startVerse, endVerse),
      verseEnd: Math.max(startVerse, endVerse),
    });
  }, [getVerseFromNode]);

  const saveHighlight = useCallback(async () => {
    if (!floatingBtn) return;
    
    // Check if already highlighted
    const alreadyHighlighted = filteredHighlights.some(h => 
      h.verseStart === floatingBtn.verseStart && 
      h.verseEnd === floatingBtn.verseEnd && 
      h.highlightText === floatingBtn.text
    );
    
    if (alreadyHighlighted) {
      setFloatingBtn(null);
      window.getSelection()?.removeAllRanges();
      return;
    }

    await apiRequest('POST', `/api/sessions/${sessionId}/highlights`, {
      bookId,
      chapter,
      bookName, // Added bookName for easier matching in export
      verseStart: floatingBtn.verseStart,
      verseEnd: floatingBtn.verseEnd,
      highlightText: floatingBtn.text,
    });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions', String(sessionId), 'highlights'] });
    setFloatingBtn(null);
    window.getSelection()?.removeAllRanges();
  }, [floatingBtn, sessionId, bookId, chapter, bookName, filteredHighlights]);

  const deleteHighlight = async (id: number) => {
    await apiRequest('DELETE', `/api/highlights/${id}`);
    queryClient.invalidateQueries({ queryKey: ['/api/sessions', String(sessionId), 'highlights'] });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        floatingBtn &&
        !(e.target as HTMLElement)?.closest("[data-testid='button-highlight']")
      ) {
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) {
            setFloatingBtn(null);
          }
        }, 100);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [floatingBtn]);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-3"
        data-testid="loading-chapter"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-serif">
          Loading {bookName} {chapter}...
        </p>
      </div>
    );
  }

  if (!chapterData || chapterData.verses.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-3"
        data-testid="empty-chapter"
      >
        <BookOpen className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Chapter not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2
          className="font-serif text-xl font-light text-muted-foreground"
          data-testid="text-chapter-title"
        >
          {bookName} {chapter}
        </h2>
      </div>

      <div
        ref={textRef}
        className="relative"
        onMouseUp={handleTextSelect}
        onTouchEnd={handleTextSelect}
      >
        {floatingBtn && (
          <div
            className="absolute z-50"
            style={{
              left: `${floatingBtn.x}px`,
              top: `${floatingBtn.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={saveHighlight}
              className="shadow-md gap-1"
              data-testid="button-highlight"
            >
              <Highlighter className="h-3 w-3" />
              Highlight
            </Button>
          </div>
        )}

        <p className="font-serif text-lg leading-relaxed text-foreground">
          {chapterData.verses.map((v) => {
            const verseHighlights = highlightsByVerse.get(v.number);
            return (
              <span
                key={v.number}
                data-verse={v.number}
              >
                <sup className="text-xs text-muted-foreground/50 mr-0.5 select-none">
                  {v.number}
                </sup>
                {verseHighlights ? renderHighlightedText(v.text, verseHighlights) : v.text}{" "}
              </span>
            );
          })}
        </p>
      </div>

      {filteredHighlights.length > 0 && (
        <Collapsible
          open={highlightsOpen}
          onOpenChange={setHighlightsOpen}
          className="mt-6"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              data-testid="button-toggle-highlights"
            >
              <Highlighter className="h-3.5 w-3.5" />
              {filteredHighlights.length} highlight{filteredHighlights.length !== 1 ? "s" : ""}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {filteredHighlights.map((h: any) => (
              <div
                key={h.id}
                className="flex items-start gap-2 group"
                data-testid={`highlight-item-${h.id}`}
              >
                <div className="flex-1 bg-amber-100/60 dark:bg-amber-900/30 rounded-md px-3 py-2">
                  <p className="text-sm font-serif italic text-foreground/80">
                    "{h.highlightText}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    vv. {h.verseStart}
                    {h.verseEnd !== h.verseStart ? `–${h.verseEnd}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteHighlight(h.id)}
                  data-testid={`button-delete-highlight-${h.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="flex justify-center pt-4">
        <Button
          onClick={onMarkRead}
          variant={isRead ? "secondary" : "default"}
          disabled={isRead}
          className="gap-2"
          data-testid="button-mark-read"
        >
          {isRead ? (
            <>
              <Check className="h-4 w-4" />
              Read
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4" />
              Mark as Read
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
