from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
from typing import Dict, Any, List, Optional


# ── Brand colors ──────────────────────────────────────────────
PRIMARY    = colors.HexColor("#0EA5E9")
SUCCESS    = colors.HexColor("#10B981")
WARNING    = colors.HexColor("#F59E0B")
DANGER     = colors.HexColor("#EF4444")
SLATE_900  = colors.HexColor("#0F172A")
SLATE_500  = colors.HexColor("#64748B")
SLATE_100  = colors.HexColor("#F1F5F9")
WHITE      = colors.white

FEATURE_LABELS = {
    "_BMI5": "BMI",
    "_AGE80": "Age",
    "SEXVAR": "Sex",
    "_IMPRACE": "Race/Ethnicity",
    "GENHLTH": "General Health",
    "PHYSHLTH": "Physical Health Days",
    "SMOKE100": "Smoking",
    "_TOTINDA": "Physical Activity",
    "EDUCA": "Education Level",
    "INCOME3": "Income Level",
    "_RFHYPE6": "Hypertension",
    "_RFCHOL3": "High Cholesterol",
    "CHCKDNY2": "Kidney Disease",
    "_MICHD": "Heart Disease",
}


def _risk_color(risk_level: str):
    if risk_level == "High Risk":
        return DANGER
    elif risk_level == "Moderate Risk":
        return WARNING
    return SUCCESS


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title", parent=base["Heading1"],
            fontSize=22, textColor=SLATE_900,
            spaceAfter=4, fontName="Helvetica-Bold",
        ),
        "subtitle": ParagraphStyle(
            "subtitle", parent=base["Normal"],
            fontSize=11, textColor=SLATE_500,
            spaceAfter=16,
        ),
        "section": ParagraphStyle(
            "section", parent=base["Heading2"],
            fontSize=13, textColor=PRIMARY,
            spaceBefore=14, spaceAfter=6,
            fontName="Helvetica-Bold",
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"],
            fontSize=10, textColor=SLATE_900,
            leading=15, spaceAfter=6,
        ),
        "muted": ParagraphStyle(
            "muted", parent=base["Normal"],
            fontSize=9, textColor=SLATE_500,
            leading=13,
        ),
        "risk_label": ParagraphStyle(
            "risk_label", parent=base["Normal"],
            fontSize=18, fontName="Helvetica-Bold",
            alignment=TA_CENTER,
        ),
        "center": ParagraphStyle(
            "center", parent=base["Normal"],
            fontSize=10, alignment=TA_CENTER,
            textColor=SLATE_500,
        ),
    }


def generate_single_report(
    prediction_data: Dict[str, Any],
    input_features: Dict[str, Any],
    shap_values: Optional[Dict[str, float]] = None,
    recommendation: Optional[str] = None,
) -> bytes:
    """Generate a single-patient PDF prediction report."""

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )

    styles = _styles()
    story = []
    risk_level = prediction_data.get("risk_level", "Unknown")
    probability = prediction_data.get("probability", 0.0)
    risk_color = _risk_color(risk_level)

    # ── Header ────────────────────────────────────────────────
    story.append(Paragraph("Diabetes Risk Assessment Report", styles["title"]))
    story.append(Paragraph(
        f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}  ·  "
        f"Diabetes Risk Predictor  ·  For informational purposes only",
        styles["subtitle"]
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=16))

    # ── Risk result card ──────────────────────────────────────
    risk_table = Table(
        [[
            Paragraph(f"{risk_level}", ParagraphStyle(
                "rl", fontSize=20, fontName="Helvetica-Bold",
                textColor=WHITE, alignment=TA_CENTER,
            )),
            Paragraph(f"{probability*100:.1f}%\nRisk Score", ParagraphStyle(
                "rs", fontSize=16, fontName="Helvetica-Bold",
                textColor=WHITE, alignment=TA_CENTER, leading=20,
            )),
        ]],
        colWidths=["55%", "45%"],
    )
    risk_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), risk_color),
        ("BACKGROUND", (1, 0), (1, 0), risk_color),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [risk_color]),
        ("ROUNDEDCORNERS", [6]),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 14))

    # ── Patient input ─────────────────────────────────────────
    story.append(Paragraph("Patient Information", styles["section"]))
    input_rows = []
    for raw, label in FEATURE_LABELS.items():
        val = input_features.get(raw) or input_features.get(label)
        if val is not None:
            input_rows.append([
                Paragraph(label, styles["body"]),
                Paragraph(str(val), styles["body"]),
            ])

    if input_rows:
        input_table = Table(input_rows, colWidths=["55%", "45%"])
        input_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), SLATE_100),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, SLATE_100]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(input_table)
    story.append(Spacer(1, 10))

    # ── SHAP explanation ──────────────────────────────────────
    if shap_values:
        story.append(Paragraph("Top Contributing Risk Factors (SHAP)", styles["section"]))
        story.append(Paragraph(
            "These are the features that most influenced this prediction. "
            "Positive values increase risk; negative values decrease it.",
            styles["muted"]
        ))
        story.append(Spacer(1, 6))

        sorted_shap = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)[:8]
        shap_rows = [["Feature", "SHAP Value", "Direction"]]
        for feat, val in sorted_shap:
            label = FEATURE_LABELS.get(feat, feat)
            direction = "↑ Increases risk" if val > 0 else "↓ Decreases risk"
            shap_rows.append([
                Paragraph(label, styles["body"]),
                Paragraph(f"{val:+.4f}", styles["body"]),
                Paragraph(direction, ParagraphStyle(
                    "dir", fontSize=9,
                    textColor=DANGER if val > 0 else SUCCESS,
                )),
            ])

        shap_table = Table(shap_rows, colWidths=["45%", "25%", "30%"])
        shap_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, SLATE_100]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(shap_table)
        story.append(Spacer(1, 10))

    # ── Recommendation ────────────────────────────────────────
    if recommendation:
        story.append(Paragraph("Personalised Recommendation", styles["section"]))
        rec_table = Table(
            [[Paragraph(recommendation, styles["body"])]],
            colWidths=["100%"],
        )
        rec_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("ROUNDEDCORNERS", [4]),
        ]))
        story.append(rec_table)
        story.append(Spacer(1, 10))

    # ── Disclaimer ────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_500, spaceBefore=10))
    story.append(Paragraph(
        "⚠ DISCLAIMER: This report is generated by a machine learning model trained on "
        "population-level survey data. It provides a risk estimate only and is not a clinical "
        "diagnosis. Always consult a qualified healthcare professional for medical advice.",
        styles["muted"]
    ))
    story.append(Paragraph(
        "Diabetes Risk Predictor · Moringa School Capstone 2026 · "
        "github.com/Orandifelix/diabetes-risk-prediction-xai",
        ParagraphStyle("footer", fontSize=8, textColor=SLATE_500,
                       alignment=TA_CENTER, spaceBefore=6),
    ))

    doc.build(story)
    return buffer.getvalue()


def generate_batch_summary_report(
    analytics: Dict[str, Any],
    filename: str,
) -> bytes:
    """Generate an executive summary PDF for a batch job."""

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )

    styles = _styles()
    story = []

    # ── Header ────────────────────────────────────────────────
    story.append(Paragraph("Batch Diabetes Risk Assessment — Summary Report", styles["title"]))
    story.append(Paragraph(
        f"File: {filename}  ·  "
        f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}",
        styles["subtitle"]
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=14))

    # ── Risk distribution cards ───────────────────────────────
    story.append(Paragraph("Risk Distribution", styles["section"]))
    total = analytics.get("total_rows", 0)

    dist_data = [[
        Paragraph(f"🔴 High Risk\n{analytics.get('high_risk_count', 0)}\n"
                  f"({analytics.get('high_risk_pct', 0)}%)",
                  ParagraphStyle("hrc", fontSize=11, fontName="Helvetica-Bold",
                                 textColor=WHITE, alignment=TA_CENTER, leading=16)),
        Paragraph(f"🟡 Moderate Risk\n{analytics.get('moderate_risk_count', 0)}\n"
                  f"({analytics.get('moderate_risk_pct', 0)}%)",
                  ParagraphStyle("mrc", fontSize=11, fontName="Helvetica-Bold",
                                 textColor=WHITE, alignment=TA_CENTER, leading=16)),
        Paragraph(f"🟢 Low Risk\n{analytics.get('low_risk_count', 0)}\n"
                  f"({analytics.get('low_risk_pct', 0)}%)",
                  ParagraphStyle("lrc", fontSize=11, fontName="Helvetica-Bold",
                                 textColor=WHITE, alignment=TA_CENTER, leading=16)),
    ]]
    dist_table = Table(dist_data, colWidths=["33%", "34%", "33%"])
    dist_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), DANGER),
        ("BACKGROUND", (1, 0), (1, 0), WARNING),
        ("BACKGROUND", (2, 0), (2, 0), SUCCESS),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(dist_table)
    story.append(Spacer(1, 12))

    # ── Summary stats ─────────────────────────────────────────
    story.append(Paragraph("Statistical Summary", styles["section"]))
    stats_data = [
        ["Total Patients", str(total)],
        ["Average Risk Score", f"{analytics.get('avg_probability', 0)*100:.1f}%"],
        ["Median Risk Score", f"{analytics.get('median_probability', 0)*100:.1f}%"],
        ["Std Deviation", f"{analytics.get('std_probability', 0)*100:.1f}%"],
    ]
    stats_rows = [
        [Paragraph(k, styles["body"]), Paragraph(v, styles["body"])]
        for k, v in stats_data
    ]
    stats_table = Table(stats_rows, colWidths=["55%", "45%"])
    stats_table.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, SLATE_100]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 12))

    # ── Top risk factors ──────────────────────────────────────
    top_factors = analytics.get("top_risk_factors", [])
    if top_factors:
        story.append(Paragraph("Top Population Risk Factors (Global SHAP)", styles["section"]))
        factor_rows = [["Rank", "Feature", "Importance Score"]]
        for i, f in enumerate(top_factors[:5], 1):
            factor_rows.append([
                Paragraph(str(i), styles["body"]),
                Paragraph(f["feature"], styles["body"]),
                Paragraph(f"{f['importance']:.4f}", styles["body"]),
            ])
        factor_table = Table(factor_rows, colWidths=["12%", "58%", "30%"])
        factor_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, SLATE_100]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(factor_table)

    # ── Footer ────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_500, spaceBefore=14))
    story.append(Paragraph(
        "⚠ This report is for screening purposes only and does not constitute a clinical diagnosis.",
        styles["muted"]
    ))
    story.append(Paragraph(
        "Diabetes Risk Predictor · Moringa School Capstone 2026",
        ParagraphStyle("footer", fontSize=8, textColor=SLATE_500,
                       alignment=TA_CENTER, spaceBefore=4),
    ))

    doc.build(story)
    return buffer.getvalue()
