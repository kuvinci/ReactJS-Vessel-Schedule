import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import { useSwipeable } from 'react-swipeable';
import Pagination from './Pagination';
import CustomSelectBox from './CustomSelectBox';

const DataTable = () => {
    const initialColumnsConfig = [
        {Header: '', accessor: 'details', id: 'details', visible: true},
        {Header: 'Berth', accessor: 'berth', id: 'berth', visible: true},
        {Header: 'Service', accessor: 'service', id: 'service', visible: true},
        {Header: 'Vessel', accessor: 'name', id: 'name', visible: true},
        {Header: 'Ocean Carrier', accessor: 'vsl_operator', id: 'vsl_operator', visible: true, nestedAccessor: 'lname'},
        {Header: 'ETA', accessor: (row) => `${row.eta_date} ${row.eta_time}`, id: 'eta', visible: true},
        {Header: 'ATA', accessor: (row) => `${row.ata_date} ${row.ata_time}`, id: 'ata', visible: true},
        {Header: 'ETD', accessor: (row) => `${row.etd_date} ${row.etd_time}`, id: 'etd', visible: true},
        {Header: 'ATD', accessor: (row) => `${row.atd_date} ${row.atd_time}`, id: 'atd', visible: true},
        {Header: '', accessor: 'is_locked', id: 'is_locked', visible: true},
        {
            Header: 'Dry Begin Receive Date',
            accessor: (row) => `${row.dry_brd_date} ${row.dry_brd_time}`,
            id: 'dry_brd',
            visible: true,
            nestedAccessor: (line) => `${line.dry_brd_date} ${line.dry_brd_time}`
        },
        {
            Header: 'Reefer Begin Receive Date',
            accessor: (row) => `${row.reefer_brd_date} ${row.reefer_brd_time}`,
            id: 'reefer_brd',
            visible: true,
            nestedAccessor: (line) => `${line.reefer_brd_date} ${line.reefer_brd_time}`
        },
        {
            Header: 'End Receive Date',
            accessor: (row) => `${row.cargo_cutoff_date} ${row.cargo_cutoff_time}`,
            id: 'cargo_cutoff',
            visible: true,
            nestedAccessor: (line) => `${line.cargo_cutoff_date} ${line.cargo_cutoff_time}`
        },
        {Header: 'Grouping', accessor: 'grouping', id: 'grouping', visible: false},
        {Header: 'Terminal', accessor: 'terminal', id: 'terminal', visible: false},
        {Header: 'Lloyds ID', accessor: 'lloyds_id', id: 'lloyds_id', visible: false},
        {Header: 'Status', accessor: 'status', id: 'status', visible: false},
        {Header: 'In Voyage', accessor: 'in_voyage', id: 'in_voyage', visible: false},
        {Header: 'Out Voyage', accessor: 'out_voyage', id: 'out_voyage', visible: false},
        {Header: 'Vessel Class', accessor: 'vessel_class', id: 'vessel_class', visible: false},
        {
            Header: 'Reefer Cutoff',
            accessor: (row) => `${row.reefer_cutoff_date} ${row.reefer_cutoff_time}`,
            id: 'reefer_cutoff',
            visible: false
        },
        {Header: 'Haz Cutoff', accessor: (row) => `${row.haz_cutoff_date} ${row.haz_cutoff_time}`, id: 'haz_cutoff', visible: false},
    ];

    const [data, setData] = useState([]);
    const [selectedTerminal, setSelectedTerminal] = useState('GCT');
    const [setHeaders] = useState([]);
    const [columnsConfig] = useState(initialColumnsConfig);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [showSwipeIcon, setShowSwipeIcon] = useState(true);
    const [swipeOpacity, setSwipeOpacity] = useState(1);
    const options = [
        {value: 'GCT', displayName: 'Garden City Terminal'},
        {value: 'OT', displayName: 'Ocean Terminal'},
    ];
    const rowOptions = [
        {value: '10', displayName: '10'},
        {value: '25', displayName: '25'},
        {value: '50', displayName: '50'},
        {value: '100', displayName: '100'},
    ];

    const handlers = useSwipeable({
        onSwiping: () => setSwipeOpacity(0),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    const handleTerminalChange = (newTerminal) => {
        setSelectedTerminal(newTerminal);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Calculate the starting index of the data for the current page
    const startIndex = (currentPage - 1) * pageSize;

    const handleSort = (key, order) => {
        const sortedData = [...data].sort((a, b) => {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
        setData(sortedData);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleRowsPerPageChange = (newValue) => {
        setPageSize(newValue);
        setCurrentPage(1);
    };

    const handleDownloadCSV = () => {
        const csvData = convertToCSV(filteredData);
        const blob = new Blob([csvData], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const convertToCSV = (data) => {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((row) => Object.values(row).join(',')).join('\n');
        return headers + '\n' + rows;
    };

    const getCellClass = (column) => {
        return `schedule__cell--${column.id}`;
    };

    const getRowClass = (row) => {
        const {grouping, atd_date} = row;

        if (grouping === 'Vessel To Come') {
            return "schedule__row--to-come";
        } else if (grouping === 'Vessels at Dock' && !atd_date) {
            return "schedule__row--at-dock";
        } else if (grouping === 'Vessels at Dock' && atd_date) {
            return "schedule__row--sailed";
        } else {
            return "schedule__row--anchor";
        }
    };


    const getLockedClass = (column, is_locked) => {
        if (column.id !== "is_locked") {
            return "";
        }

        switch (is_locked) {
            case "Yes":
                return "schedule__cell--locked";
            case "Tomorrow":
                return "schedule__cell--almost-locked";
            default:
                return "";
        }
    };

    const renderHeaderContent = (column, row) => {
        if (column.accessor === "details") {
            return (
                <Button
                    variant="link"
                    onClick={() => setExpandedRow(expandedRow === row.lloyds_id ? null : row.lloyds_id)}
                    className={!row.lines || row.lines.length === 0 ? "schedule__button--disabled" : ""}
                    disabled={!row.lines || row.lines.length === 0}
                >
                    <img src={`${window.pluginParams.assetsUrl}/accordion.svg`} alt="Show More"/>
                </Button>
            );
        }

        if (typeof column.accessor === "function") {
            return column.accessor(row);
        }

        if (column.id === "is_locked") {
            return row[column.accessor] === "Yes" ? (
                <img src={`${window.pluginParams.assetsUrl}/locked.svg`} alt="Locked"/>
            ) : row[column.accessor] === "Tomorrow" ? (
                <img src={`${window.pluginParams.assetsUrl}/almost-locked.svg`} alt="Almost Locked"/>
            ) : null;
        }

        return row[column.accessor];
    };

    // Data extraction from the JSON files
    useEffect(() => {
        const fetchData = async () => {
            const jsonFileName = selectedTerminal === 'GCT' ? 'vessel_gct_data.json' : 'vessel_ot_data.json';
            const response = await fetch(`/wp-content/plugins/vessel-schedule/build/assets/${jsonFileName}`);
            // const response = await fetch(`/assets/${jsonFileName}`);
            const data = await response.json();

            return data.data;
        };

        fetchData().then((rows) => {
            setData(rows);
        });
    }, [setHeaders, selectedTerminal]);

    // Search functionality
    useEffect(() => {
        const filtered = data.filter((row) => Object.values(row).some((value) => value.toString().toLowerCase().includes(search.toLowerCase())));
        setFilteredData(filtered);
        setCurrentPage(1);
    }, [search, data]);

    // Slice the data array based on the page size
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    const searchStyle = {
        backgroundImage: `url(${window.pluginParams.assetsUrl}/search.svg)`
    }

    return (<div className="schedule">
        <div className={"schedule__terminal"}>
            <div className={"schedule__terminal--left"}>
                <h1>Garden City Terminal Vessels </h1>
                <div className={"schedule__terminal--wrapper"}>
                    <label htmlFor="terminal">Terminal:</label>
                    <CustomSelectBox
                        className={'schedule__select--terminal'}
                        options={options}
                        value={selectedTerminal}
                        onChange={(value) => handleTerminalChange(value)}
                    />
                </div>
            </div>
            <div className={"schedule__terminal--right"}>
                <div className={"schedule__legend"}>
                    <div className={"schedule__legend__top-bar"}>Legend</div>
                    <div className={"schedule__legend__statuses"}>
                        <div className="schedule__legend__status schedule__legend__status--come"><span></span>To Come</div>
                        <div className="schedule__legend__status schedule__legend__status--anchor"><span></span>At Anchor</div>
                        <div className="schedule__legend__status schedule__legend__status--dock"><span></span>At Dock</div>
                        <div className="schedule__legend__status schedule__legend__status--sailed"><span></span>Sailed</div>
                    </div>
                    <div className={"schedule__legend__description"}>
                        <div className="schedule__legend__description--left">
                            <span><strong>ETA-</strong> Estimated Time of Arrival <br/></span>
                            <span><strong>ATA-</strong> Actual Time of Arrival</span>
                        </div>
                        <div className="schedule__legend__description--right">
                            <span><strong>ETD-</strong> Estimated Time of Departure <br/></span>
                            <span><strong>ATD-</strong> Actual Time of Departure</span>
                        </div>
                        <div className="schedule__legend__description--bottom">
                            <div><strong>Locked Receive Date Status:</strong></div>
                            <div>
                                <img src={`${window.pluginParams.assetsUrl}/locked.svg`} alt="Locked"/>
                                -BRD/ERD is currently locked
                            </div>
                            <div>
                                <img src={`${window.pluginParams.assetsUrl}/almost_locked.svg`} alt="Almost Locked"/>
                                -BRD/ERD will be locked soon
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={"schedule__content"}>
                <p className={"schedule__content__paragraph"}>A- crane height 120’ (Berth 2 & 3)</p>
                <p className={"schedule__content__paragraph"}>B- crane height range from 120’-152’ (Berth 4 & 6)</p>
                <p className={"schedule__content__paragraph"}>C- crane height 152’ (Berth 7 & 8)</p>
                <p className={"schedule__content__paragraph schedule__content__paragraph--small"}>Last minute changes to berthing plan may occur due to the exports loading to
                    specific <br></br>
                    vessel, and the crane height required to support loading.</p>
            </div>
        </div>
        <div className={"schedule__controls"}>
            <div className={"schedule__controls--left"}>
                <input id="search" type="text" style={searchStyle} value={search} onChange={handleSearch}/>

                <div className="schedule__controls--select-wrapper">
                    <CustomSelectBox
                        className={'schedule__select--rows'}
                        options={rowOptions}
                        value={pageSize.toString()}
                        onChange={(value) => handleRowsPerPageChange(parseInt(value))}
                        appendText={"Entries"}
                    />
                </div>
            </div>
            <button className={"schedule__download"} onClick={handleDownloadCSV}>
                <img className={"schedule__download--csv"} src={`${window.pluginParams.assetsUrl}/csv.svg`} alt="CSV"/>
                CSV
                <img className={"schedule__download--download"} src={`${window.pluginParams.assetsUrl}/download.svg`} alt="Download"/>
            </button>
        </div>
        <div {...handlers} className={"schedule__table"}>
            {columnsConfig
                .filter((column) => column.visible)
                .map((column, index) => (
                    <div key={index} className={`schedule__header ${column.Header ? "" : "schedule__header--empty"}`}>
                        <div className={"schedule__header--text"}>{column.Header}</div>
                        {column.Header && (
                            <div>
                                <button onClick={() => handleSort(column.id || column.accessor, "asc")}>
                                    <img src={`${window.pluginParams.assetsUrl}/arrow-up.svg`} alt="Up"/>
                                </button>
                                <button onClick={() => handleSort(column.id || column.accessor, "desc")}>
                                    <img src={`${window.pluginParams.assetsUrl}/arrow-down.svg`} alt="Down"/>
                                </button>
                            </div>
                        )}
                    </div>
                ))
            }
            {paginatedData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                    <div className={`schedule__row ${getRowClass(row)}`}>
                        {columnsConfig.map((column, cellIndex) =>
                            column.visible && (
                                <div
                                    key={cellIndex}
                                    className={`schedule__cell ${getLockedClass(column, row.is_locked)} ${getCellClass(column)}`}
                                >
                                    {renderHeaderContent(column, row)}
                                </div>
                            )
                        )}
                    </div>
                    {expandedRow === row.lloyds_id && (
                        <div className={`schedule__row schedule__row--inner ${getRowClass(row)}`}>
                            {row.lines.map((line, lineIndex) => (
                                <React.Fragment key={lineIndex}>
                                    {columnsConfig
                                        .filter((col) => col.visible)
                                        .map((col, idx) => (
                                            <div className={"schedule__cell"} key={idx}>
                                                {typeof col.nestedAccessor === "function" ? col.nestedAccessor(line) : line[col.nestedAccessor]}
                                            </div>
                                        ))
                                    }
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                </React.Fragment>
            ))}
            {showSwipeIcon && (
                <div className="schedule__table--overlay" style={{opacity: swipeOpacity}}>
                    <img src={`${window.pluginParams.assetsUrl}/swipe.svg`} alt="Swipe to scroll"/>
                </div>
            )}
        </div>
        <p className={"schedule__table--bottom-text"}>
            Ocean carrier cargo cuts may not match GPA’s published End Receive Dates. Please consult with your carrier for their cutoff. <br></br>
            Late arrival/gate cargo remains at the discretion of the ocean carrier and their stevedore.
        </p>
        <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={handlePageChange}
        />
    </div>);
}

export default DataTable;